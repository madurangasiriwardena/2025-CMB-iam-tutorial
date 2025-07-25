import logging
import os
from typing import Dict, List, Optional
import uuid
import requests
from pydantic import BaseModel
import secrets
import base64
import hashlib

logger = logging.getLogger(__name__)

class AuthToken(BaseModel):
    id: str
    scopes: List[str]
    token: str

class AuthCode(BaseModel):
    state: str
    user_id: str
    code: Optional[str]
    scopes: List[str]

class AgentConfig(BaseModel):
    agent_name: str
    agent_id: str
    agent_secret: str

class AsgardeoManager:
    """
    Manages OAuth2 authentication flow and token management
    """

    def __init__(self):
        # Initialize OAuth2 configuration
        self.client_id = os.environ['CLIENT_ID']
        self.client_secret = os.environ['CLIENT_SECRET']
        self.token_url = os.environ['TOKEN_URL']
        self.authorize_url = os.environ['AUTHORIZE_URL']
        self.authn_url = os.environ['AUTHN_URL']
        self.redirect_uri = os.environ['REDIRECT_URI']
        self.agent_id=os.environ['AGENT_ID']
        self.agent_name=os.environ['AGENT_NAME']
        self.agent_secret=os.environ['AGENT_SECRET']

        self.auth_codes: Dict[str, AuthCode] = {}  # Store AuthCode by session_id
        self.auth_tokens: Dict[str, AuthToken] = {}  # Store AuthToken by token_id
        self.agent_tokens: Dict[str, AuthToken] = {}  # Store AuthToken by token_id
        self.thread_user_map: Dict[str, str] = {}  # Store user_id against thread_id
        self.state_thread_map: Dict[str, str] = {}  # Store thread_id against state
        self.state_mapping: Dict[str, AuthCode] = {}
        self.user_claims: Dict[str, Dict] = {}

    def store_auth_code(self, user_id: str, code: str):
            """Store authentication code and user_id"""
            code_entry:AuthCode = self.get_auth_code(user_id)
            if not code_entry:
                raise ValueError("No auth code found for user")
            code_entry.code = code
            self.auth_codes[user_id] = code_entry

    def get_auth_code(self, user_id: str) -> Optional[AuthCode]:
        """Retrieve the AuthCode for a user_id"""
        return self.auth_codes.get(user_id)

    def get_authorization_url(self, thread_id: str, user_id: str, scopes: List[str] = ["openid"]) -> str:
            """
            Generate the authorization URL for the OAuth2 flow matching the exact format provided,
            with scopes passed as a list
            """
            try:

                scopes_str = " ".join(scopes)
                nonce = str(uuid.uuid4())[:16]
                state = str(uuid.uuid4())

                # Generate the authorization URL based on the org
                authorization_url = (
                    f"{self.authorize_url}?"
                    f"client_id={self.client_id}&"
                    f"redirect_uri={self.redirect_uri}&"
                    f"scope={scopes_str}&" 
                    f"response_type=code&"
                    f"response_mode=query&"
                    f"state={state}&"
                    f"requested_actor={self.agent_id}&"
                    f"nonce={nonce}&"
                    f"orgId={self.get_user_claims(self.get_user_id_from_thread_id(thread_id))['user_org']}&"
                    f"fidp=OrganizationSSO"
                )
                self.store_thread_id_against_state(thread_id, state)
                auth_code = AuthCode(state=state, user_id=user_id, code=None, scopes=scopes)
                self.state_mapping[state] = auth_code
                # Store auth code entry
                self.auth_codes[self.get_token_key(user_id, scopes)] = auth_code
                return authorization_url
            except Exception as e:
                raise

    def fetch_user_token(self, state: str) -> str:
        """
        Exchange authorization code for access token
        """
        code_entry:AuthCode = self.state_mapping.get(state)
        if not code_entry:
            raise ValueError("No auth code found for user")
        try:
            response = requests.post(
                self.token_url,
                data={
                    "grant_type": "authorization_code",
                    "code": code_entry.code,
                    "scope": " ".join(code_entry.scopes),
                    "redirect_uri": self.redirect_uri,
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "actor_token":self.agent_tokens[self.get_thread_id_from_state(state)]
                },
                verify=False
            )
            data = response.json()
            access_token = data.get("access_token")
            token_key = self.get_token_key(code_entry.user_id, code_entry.scopes)
            token = AuthToken(id=code_entry.user_id, scopes=code_entry.scopes, token=access_token)
            self.auth_tokens[token_key] = token
            return access_token
        except Exception as e:
            print(e)
            raise

    def fetch_agent_token(self, thread_id: str) -> str:
        """
        Exchange authorization code for access token
        """
        if thread_id in self.agent_tokens and self.agent_tokens[thread_id]:
            return self.agent_tokens[thread_id]
        try:

            code_verifier = self.generate_code_verifier()
            code_challenge = self.generate_code_challenge(code_verifier)
            response = requests.post(
                self.authorize_url,
                data={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "response_type": "code",
                    "redirect_uri": self.redirect_uri,
                    "state": "1234",
                    "scope": "openid",
                    "response_mode": "direct",
                    "code_challenge": code_challenge,
                    "code_challenge_method": "S256",
                    "resource": "http://localhost:9091"
                },
                verify=False
            )
            resp_json = response.json()

            flow_id = resp_json.get("flowId")
            # TODO Extract this from the response
            idf_authenticator_id = "QmFzaWNBdXRoZW50aWNhdG9yOkxPQ0FM"

            # Step 2: Authenticate with IDF
            idf_body = {
                "flowId": flow_id,
                "selectedAuthenticator": {
                    "authenticatorId": idf_authenticator_id,
                    "params": {
                        "username": self.agent_name,
                        "password": self.agent_secret
                    }
                }
            }
            resp = requests.post(self.authn_url, json=idf_body, verify=False)
            resp_json = resp.json()

            code = resp_json.get("authData", {}).get("code")
            if not code:
                return None

            # Step 4: Get token
            token_data = {
                "grant_type": "authorization_code",
                "client_id": self.client_id,
                "client_secret": self.client_secret,
                "code": code,
                "code_verifier": code_verifier,
                "redirect_uri": self.redirect_uri,
                "scope": "openid",
                "resource": "http://localhost:9091"
            }

            headers = {"Content-Type": "application/x-www-form-urlencoded"}
            resp = requests.post(self.token_url, data=token_data, headers=headers, verify=False)

            resp_json = resp.json()

            access_token = resp_json.get("access_token")

            self.agent_tokens[thread_id] = access_token
            return access_token
        except Exception as e:
            print(e)
            raise

    def generate_code_verifier(self, length: int = 64) -> str:
        return secrets.token_urlsafe(length)[:length]

    def generate_code_challenge(self, code_verifier: str) -> str:
        sha256_digest = hashlib.sha256(code_verifier.encode('utf-8')).digest()
        code_challenge = base64.urlsafe_b64encode(sha256_digest).rstrip(b'=').decode('utf-8')
        return code_challenge

    def fetch_app_token(self, scopes: List[str]) -> str:
        """
        Get an access token for the app
        """
        try:
            response = requests.post(
                self.token_url,
                data={
                    "grant_type": "client_credentials",
                    "scope": " ".join(scopes),
                    "client_id": self.client_id,
                    "client_secret": self.client_secret
                },
                verify=False
            )
            data = response.json()
            return data.get("access_token")
        except Exception as e:
            raise


    def get_user_token(self, user_id: str, scopes: List[str]) -> str:
        """
        Get valid m2m token.
        """
        token_key = self.get_token_key(user_id, scopes)
        token_entry:AuthToken = self.auth_tokens.get(token_key)
        if token_entry:
            return token_entry.token
        return None

    def get_token_key(self, id: str, scopes: List[str]) -> str:
        """
        Get token key from id and scopes
        """
        return id+'_'+"_".join(scopes)

    def store_user_id_against_thread_id(self, thread_id: str, user_id: str):
        """
        Store user_id against thread_id
        """
        self.thread_user_map[thread_id] = user_id

    def get_user_id_from_thread_id(self, thread_id: str) -> str:
        """
        Get user_id from thread_id
        """
        return self.thread_user_map.get(thread_id)

    def store_thread_id_against_state(self, thread_id: str, state: str):
        """
        Store thread_id against state
        """
        self.state_thread_map[state] = thread_id

    def get_thread_id_from_state(self, state: str) -> str:
        """
        Get thread_id from state
        """
        return self.state_thread_map.get(state)

    def store_user_claims(self, user_id: str, claims: Dict):
        """
        Store user claims
        """
        self.user_claims[user_id] = claims

    def get_user_claims(self, user_id: str) -> Dict:
        """
        Get user claims
        """
        return self.user_claims.get(user_id)

asgardeo_manager = AsgardeoManager()
