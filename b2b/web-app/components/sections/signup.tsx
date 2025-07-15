import React, { useState } from "react";
import {
  Modal,
  Loader,
  Message,
  Button,
  useToaster,
} from "rsuite";
import AndroidIcon from "@rsuite/icons/Android";
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
                  <Field name="subscription" initialValue="basic">
                    {({ input, meta }) => (
                      <>
                        <table className={styles.subscriptionTable}>
                          <thead>
                            <tr>
                              <th>Features</th>
                              <th
                                onClick={() => input.onChange("basic")}
                                className={`${styles.clickable} ${input.value === "basic" ? styles.selected : ""}`}
                              >
                                Basic
                              </th>
                              <th
                                onClick={() => input.onChange("business")}
                                className={`${styles.clickable} ${input.value === "business" ? styles.selected : ""}`}
                              >
                                Business
                              </th>
                              <th
                                onClick={() => input.onChange("enterprise")}
                                className={`${styles.clickable} ${input.value === "enterprise" ? styles.selected : ""}`}
                              >
                                Enterprise
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>Price</td>
                              <td onClick={() => input.onChange("basic")} className={`${styles.clickable} ${input.value === "basic" ? styles.selected : ""}`}>
                                Free
                              </td>
                              <td onClick={() => input.onChange("business")} className={`${styles.clickable} ${input.value === "business" ? styles.selected : ""}`}>
                                $5/user/mo
                              </td>
                              <td onClick={() => input.onChange("enterprise")} className={`${styles.clickable} ${input.value === "enterprise" ? styles.selected : ""}`}>
                                $9/user/mo
                              </td>
                            </tr>
                            <tr>
                              <td>Meeting duration</td>
                              <td
                                onClick={() => input.onChange("basic")}
                                className={`${styles.clickable} ${input.value === "basic" ? styles.selected : ""}`}
                              >
                                30 min
                              </td>
                              <td
                                onClick={() => input.onChange("business")}
                                className={`${styles.clickable} ${input.value === "business" ? styles.selected : ""}`}
                              >
                                60 min
                              </td>
                              <td
                                onClick={() => input.onChange("enterprise")}
                                className={`${styles.clickable} ${input.value === "enterprise" ? styles.selected : ""}`}
                              >
                                Unlimited
                              </td>
                            </tr>
                            <tr>
                              <td>Number of users</td>
                              <td
                                onClick={() => input.onChange("basic")}
                                className={`${styles.clickable} ${input.value === "basic" ? styles.selected : ""}`}
                              >
                                10
                              </td>
                              <td
                                onClick={() => input.onChange("business")}
                                className={`${styles.clickable} ${input.value === "business" ? styles.selected : ""}`}
                              >
                                100
                              </td>
                              <td
                                onClick={() => input.onChange("enterprise")}
                                className={`${styles.clickable} ${input.value === "enterprise" ? styles.selected : ""}`}
                              >
                                Unlimited
                              </td>
                            </tr>
                            <tr>
                              <td>Plug in your IDP</td>
                              <td
                                onClick={() => input.onChange("basic")}
                                className={`${styles.clickable} ${input.value === "basic" ? styles.selected : ""}`}
                              >
                                -
                              </td>
                              <td
                                onClick={() => input.onChange("business")}
                                className={`${styles.clickable} ${input.value === "business" ? styles.selected : ""}`}
                              >
                                Yes
                              </td>
                              <td
                                onClick={() => input.onChange("enterprise")}
                                className={`${styles.clickable} ${input.value === "enterprise" ? styles.selected : ""}`}
                              >
                                Yes
                              </td>
                            </tr>
                            <tr>
                              <td>Personalization</td>
                              <td
                                onClick={() => input.onChange("basic")}
                                className={`${styles.clickable} ${input.value === "basic" ? styles.selected : ""}`}
                              >
                                Basic
                              </td>
                              <td
                                onClick={() => input.onChange("business")}
                                className={`${styles.clickable} ${input.value === "business" ? styles.selected : ""}`}
                              >
                                Advanced
                              </td>
                              <td
                                onClick={() => input.onChange("enterprise")}
                                className={`${styles.clickable} ${input.value === "enterprise" ? styles.selected : ""}`}
                              >
                                Custom
                              </td>
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
                        <div className={styles.addonContainer}>
                          <div
                            className={`${styles.addonOption} ${input.value.includes('teamspace-agent') ? styles.addonSelected : ''}`}
                            onClick={() => {
                              if (input.value.includes('teamspace-agent')) {
                                input.onChange(input.value.filter((v) => v !== 'teamspace-agent'));
                              } else {
                                input.onChange([...(input.value || []), 'teamspace-agent']);
                              }
                            }}
                          >
                            <span>
                              <AndroidIcon className={styles.addonIcon} />
                              Teamspace Agent
                            </span>
                            <div className={styles.addonDescription}>
                              Increase productivity with an AI agent
                            </div>
                          </div>
                        </div>
                      </FormField>
                    )}
                  </Field>
                </>
              )}

              <div className={styles.buttonToolbarContainer}>
                {step === 2 && (
                  <Button appearance="subtle" onClick={() => setStep(1)}>
                    Back
                  </Button>
                )}
                <FormButtonToolbar
                  submitButtonText={step === 1 ? "Next" : "Sign Up"}
                  submitButtonDisabled={loading}
                  onCancel={onClose}
                />
              </div>
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
