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
} from "@teamspace-app/shared/ui/ui-basic-components";
import FormSuite from "rsuite/Form";
import { getConfig } from "@teamspace-app/util-application-config-util";
import styles from "./signup.module.css";

export const SignUp = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [step, setStep] = useState(1);

  const subscriptionPackages = [
    {
      id: "basic",
      label: "Basic",
      price: 0,
      meetingDuration: "30 min",
      idp: "-",
      personalization: "-",
    },
    {
      id: "business",
      label: "Business",
      price: 5,
      meetingDuration: "60 min",
      idp: "-",
      personalization: "Basic",
    },
    {
      id: "enterprise",
      label: "Enterprise",
      price: 9,
      meetingDuration: "Unlimited",
      idp: "Yes",
      personalization: "Advanced",
    },
  ];

  const subscriptionFeatures = [
    { key: "price", label: "Price" },
    { key: "meetingDuration", label: "Meeting duration" },
    { key: "idp", label: "Plug in your IDP" },
    { key: "personalization", label: "Personalization" },
  ];

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
          initialValues={{ subscription: "basic", addons: [] }}
          render={({ handleSubmit, values }) => (
            <FormSuite
              layout="vertical"
              onSubmit={handleSubmit}
              fluid
              style={{ overflow: "visible" }}
            >
              {step === 1 && (
                <div className={styles.formFields}>
                  <FormField name="email" label="Email" needErrorMessage={true}>
                    <FormSuite.Control name="email" required className={styles.shortInput} />
                  </FormField>

                  <Field name="password">
                    {({ input, meta }) => (
                      <FormField
                        name="password"
                        label="Password"
                        needErrorMessage={true}
                      >
                        <>
                          <FormSuite.Control
                            {...input}
                            type="password"
                            className={styles.shortInput}
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
                    <FormSuite.Control name="firstName" required className={styles.shortInput} />
                  </FormField>

                  <FormField name="lastName" label="Last Name" needErrorMessage={true}>
                    <FormSuite.Control name="lastName" required className={styles.shortInput} />
                  </FormField>

                  <FormField name="organizationName" label="Organization Name" needErrorMessage={true}>
                    <FormSuite.Control name="organizationName" required className={styles.shortInput} />
                  </FormField>
                </div>
              )}

              {step === 2 && (
                <div className={styles.formFields}>
                  <Field name="subscription" initialValue="basic">
                    {({ input, meta }) => (
                      <>
                        <table className={styles.subscriptionTable}>
                          <thead>
                            <tr>
                              <th>Features</th>
                              {subscriptionPackages.map((pkg) => (
                                <th
                                  key={pkg.id}
                                  onClick={() => input.onChange(pkg.id)}
                                  className={`${styles.clickable} ${input.value === pkg.id ? styles.selected : ""}`}
                                  style={{ textAlign: "center", verticalAlign: "middle" }}
                                >
                                  {pkg.label}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {subscriptionFeatures.map((feature) => (
                              <tr key={feature.key}>
                                <td>{feature.label}</td>
                                {subscriptionPackages.map((pkg) => (
                                  <td
                                    key={pkg.id}
                                    onClick={() => input.onChange(pkg.id)}
                                    className={`${styles.clickable} ${input.value === pkg.id ? styles.selected : ""}`}
                                    style={{ textAlign: "center", verticalAlign: "middle" }}
                                  >
                                    {feature.key === "price"
                                      ? (
                                          pkg.price === 0 ? (
                                            <span className={styles.priceMain}>Free</span>
                                          ) : (
                                            <>
                                              <span className={styles.priceMain}>{`$${pkg.price}`}</span><br />
                                              <span className={styles.priceSub}>/month/user</span>
                                            </>
                                          )
                                        )
                                      : (
                                          (pkg as any)[feature.key]
                                        )
                                    }
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {meta.touched && meta.error && (
                          <div className={styles.error}>{meta.error}</div>
                        )}
                      </>
                    )}
                  </Field>
                </div>
              )}

              <div className={styles.buttonToolbarContainer}>
                {step === 2 && (
                  <Button
                    type="button"
                    appearance="default"
                    size="lg"
                    className={styles.backButton}
                    onClick={() => setStep(1)}
                  >
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
