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

  const subscriptionPackages = [
    {
      id: "basic",
      label: "Basic",
      price: 0,
      meetingDuration: "30 min",
      users: "10",
      idp: "-",
      personalization: "Basic",
    },
    {
      id: "business",
      label: "Business",
      price: 5,
      meetingDuration: "60 min",
      users: "100",
      idp: "Yes",
      personalization: "Advanced",
    },
    {
      id: "enterprise",
      label: "Enterprise",
      price: 9,
      meetingDuration: "Unlimited",
      users: "Unlimited",
      idp: "Yes",
      personalization: "Custom",
    },
  ];

  const subscriptionFeatures = [
    { key: "price", label: "Price" },
    { key: "meetingDuration", label: "Meeting duration" },
    { key: "users", label: "Number of users" },
    { key: "idp", label: "Plug in your IDP" },
    { key: "personalization", label: "Personalization" },
  ];

  const addonOptions = [
    {
      id: "teamspace-agent",
      label: "Teamspace Agent",
      price: 3,
      description: "Increase productivity with an AI agent",
      Icon: AndroidIcon,
    },
  ];

  const calculateTotal = (subscription: string, addons: string[] = []) => {
    const sub = subscriptionPackages.find((s) => s.id === subscription);
    let total = sub ? sub.price : 0;
    addons.forEach((addon) => {
      const opt = addonOptions.find((a) => a.id === addon);
      if (opt) {
        total += opt.price;
      }
    });
    return total;
  };

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
                          {addonOptions.map((addon) => {
                            const Icon = addon.Icon;
                            return (
                              <div
                                key={addon.id}
                                className={`${styles.addonOption} ${input.value.includes(addon.id) ? styles.addonSelected : ""}`}
                                onClick={() => {
                                  if (input.value.includes(addon.id)) {
                                    input.onChange(input.value.filter((v) => v !== addon.id));
                                  } else {
                                    input.onChange([...(input.value || []), addon.id]);
                                  }
                                }}
                              >
                                <span>
                                  <Icon className={styles.addonIcon} />
                                  <strong>{addon.label}</strong>
                                </span>
                                <div className={styles.addonDescription}>{addon.description}</div>
                                <div className={styles.addonPrice}>
                                  {addon.price === 0 ? 'Free' : `$${addon.price}/user/mo`}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </FormField>
                    )}
                  </Field>

                  <div className={styles.totalPrice}>
                    {`Total at signup: ${
                      calculateTotal(values.subscription, values.addons) === 0
                        ? 'Free'
                        : `$${calculateTotal(values.subscription, values.addons)}/user/mo`
                    }`}
                  </div>
                </div>
              )}

              <div className={styles.buttonToolbarContainer}>
                {step === 2 && (
                  <Button
                    appearance="primary"
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
