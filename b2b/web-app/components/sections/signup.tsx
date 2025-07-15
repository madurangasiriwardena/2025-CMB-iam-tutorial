import React, { useState } from "react";
import {
  Modal,
  Loader,
  Message,
  Checkbox,
  CheckboxGroup,
  Radio,
  useToaster,
} from "rsuite";
import { Form, Field } from "react-final-form";
import {
  FormButtonToolbar,
  FormField,
} from "@pet-management-webapp/shared/ui/ui-basic-components";
import FormSuite from "rsuite/Form";
import { getConfig } from "@pet-management-webapp/util-application-config-util";
import styles from "./signup.module.css";

export const SignUp = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);

  const toaster = useToaster();

  const validatePassword = (value) => {
    if (!value) {
      return "Password is required";
    }

    if (value.length < 8 || value.length > 30) {
      return "Password must be between 8 and 30 characters";
    }

    if (!/[A-Z]/.test(value)) {
      return "Password must contain at least one uppercase letter";
    }

    if (!/\d/.test(value)) {
      return "Password must contain at least one digit";
    }

    return undefined;
  };

  const validate = (values) => {
    const errors = {};

    const passwordError = validatePassword(values.password);
    if (passwordError) {
      errors.password = passwordError;
    }

    if (step === 1) {
      if (!values.email) {
        errors.email = "Email is required";
      }
      if (!values.firstName) {
        errors.firstName = "First name is required";
      }
      if (!values.lastName) {
        errors.lastName = "Last name is required";
      }
      if (!values.organizationName) {
        errors.organizationName = "Organization name is required";
      }
    }

    if (step === 2 && !values.subscription) {
      errors.subscription = "Subscription is required";
    }

    return errors;
  };

  const handleSignUp = async (values) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          organizationName: values.organizationName,
          subscription: values.subscription,
          addons: values.addons,
          appName:
            getConfig().BusinessAdminAppConfig.ManagementAPIConfig
              .SharedApplicationName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to sign up");
      }

      toaster.push(
        <Message type="success" closable>
          Sign up successful! Your profile and organization has been created.
        </Message>
      );

      onClose();
    } catch (error) {
      console.error("Signup error:", error);
      setError(error.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  const onFormSubmit = async (values) => {
    if (step === 1) {
      setStep(2);
      return;
    }

    await handleSignUp(values);
  };

  return (
    <Modal open={open} onClose={onClose} size="lg">
      <Modal.Header style={{ marginTop: 10, textAlign: "center" }}>
        <Modal.Title>Sign Up</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form
          onSubmit={onFormSubmit}
          validate={validate}
          render={() => (
            <FormSuite
              layout="vertical"
              onSubmit={onFormSubmit}
              fluid
              style={{ overflow: "visible" }}
            >
              {step === 1 && (
                <>
                  <FormField name="email" label="Email" needErrorMessage={true}>
                    <FormSuite.Control name="email" required />
                  </FormField>

                  <Field name="password">
                    {({ input, meta }) => (
                      <FormField name="password" label="Password">
                        <>
                          <FormSuite.Control
                            {...input}
                            type="password"
                            error={meta.touched && meta.error}
                            errorMessage={meta.touched && meta.error}
                            required
                          />
                          <FormSuite.HelpText>
                            Password must be 8-30 characters with at least one uppercase
                            letter and digit.
                          </FormSuite.HelpText>
                        </>
                      </FormField>
                    )}
                  </Field>

                  <FormField name="firstName" label="First Name" needErrorMessage={true}>
                    <FormSuite.Control name="firstName" required />
                  </FormField>

                  <FormField name="lastName" label="Last Name" needErrorMessage={true}>
                    <FormSuite.Control name="lastName" required />
                  </FormField>

                  <FormField name="organizationName" label="Organization Name" needErrorMessage={true}>
                    <FormSuite.Control name="organizationName" required />
                  </FormField>
                </>
              )}

              {step === 2 && (
                <>
                  <Field name="subscription">
                    {({ input, meta }) => (
                      <>
                        <table className={styles.subscriptionTable}>
                          <thead>
                            <tr>
                              <th>Features</th>
                              <th>Basic</th>
                              <th>Business</th>
                              <th>Enterprise</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Select Plan</td>
                              <td>
                                <Radio
                                  {...input}
                                  value="basic"
                                  checked={input.value === "basic"}
                                  onChange={() => input.onChange("basic")}
                                />
                              </td>
                              <td>
                                <Radio
                                  {...input}
                                  value="business"
                                  checked={input.value === "business"}
                                  onChange={() => input.onChange("business")}
                                />
                              </td>
                              <td>
                                <Radio
                                  {...input}
                                  value="enterprise"
                                  checked={input.value === "enterprise"}
                                  onChange={() => input.onChange("enterprise")}
                                />
                              </td>
                            </tr>
                            <tr>
                              <td>Meeting duration</td>
                              <td>30 min</td>
                              <td>60 min</td>
                              <td>Unlimited</td>
                            </tr>
                            <tr>
                              <td>Number of users</td>
                              <td>10</td>
                              <td>100</td>
                              <td>Unlimited</td>
                            </tr>
                            <tr>
                              <td>Plug in your IDP</td>
                              <td>-</td>
                              <td>Yes</td>
                              <td>Yes</td>
                            </tr>
                            <tr>
                              <td>Personalization</td>
                              <td>Basic</td>
                              <td>Advanced</td>
                              <td>Custom</td>
                            </tr>
                          </tbody>
                        </table>
                        {meta.touched && meta.error && (
                          <div className={styles.error}>{meta.error}</div>
                        )}
                      </>
                    )}
                  </Field>

                  <Field name="addons" initialValue={[]}>
                    {({ input }) => (
                      <FormField name="addons" label="Add-ons">
                        <FormSuite.Control
                          {...input}
                          name="checkbox"
                          accepter={CheckboxGroup}
                        >
                          <Checkbox value="teamspace-agent">Teamspace Agent</Checkbox>
                        </FormSuite.Control>
                      </FormField>
                    )}
                  </Field>
                </>
              )}

              <FormButtonToolbar
                submitButtonText={step === 1 ? "Next" : "Sign Up"}
                submitButtonDisabled={loading}
                block
                onCancel={onClose}
              />
              {loading && (
                <Loader size="sm" backdrop content="Signing you up!" vertical />
              )}
              {error && <Message type="error">{error}</Message>}
            </FormSuite>
          )}
        />
      </Modal.Body>
    </Modal>
  );
};
