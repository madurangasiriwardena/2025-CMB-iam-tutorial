import ballerina/http;
import ballerina/jwt;

public type UserInfo record {|
    string organization;
    string userId;
    string emailAddress?;
    string[] groups?;
    string actorUserId?; // Added to hold act.sub if available
|};

public isolated class UserInfoResolver {

    # Returns the user information.
    #
    # + headers - headers in the request
    # + return - UserInfo record or error
    public isolated function retrieveUserInfo(http:Headers headers) returns UserInfo|error {

        string jwtHeader = "";
        var authHeader = headers.getHeader("Header1");
        if authHeader is http:HeaderNotFoundError {
            return authHeader;
        } else {
            if (authHeader.startsWith("Bearer ")) {
                jwtHeader = authHeader.substring(7);
            }
        }

        [jwt:Header, jwt:Payload] [_, payload] = check jwt:decode(jwtHeader);
        string org = self.getOrgFromPayload(payload);
        string user = self.getUserFromPayload(payload);
        string email = self.getEmail(payload);
        string[] groups = self.getGroups(payload);
        string actorUserId = "";
        if payload.hasKey("act") {
            var actClaim = payload["act"];
            if actClaim is map<json> && actClaim.hasKey("sub") {
                actorUserId = <string>actClaim["sub"];
            }
        }
        UserInfo userInfo = {
            organization: org,
            userId: user,
            emailAddress: email,
            groups: groups,
            actorUserId: actorUserId != "" ? actorUserId : ()
        };

        return userInfo;
    }

    private isolated function getUserFromPayload(jwt:Payload payload) returns string {

        string? subClaim = payload.sub;
        if subClaim is () {
            subClaim = "Test_Key_User";
        }

        return <string>subClaim;
    }

    private isolated function getOrgFromPayload(jwt:Payload payload) returns string {

        string? user_org = payload["user_org"].toString();
        if user_org is "" {
            user_org = "Test_Key_Org";
        }

        return <string>user_org;
    }

    private isolated function getEmail(jwt:Payload payload) returns string {
        return payload["email"].toString();
    }

    private isolated function getGroups(jwt:Payload payload) returns string[] {

        if payload["groups"] is () {
            return [];
        }

        json[] groups = <json[]>payload["groups"];
        string[] groupList = [];
        foreach json item in groups {
            groupList.push(<string>item);
        }

        return groupList;
    }

}
