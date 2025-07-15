import React, { useState } from "react";
import {
  Modal,
  Loader,
  Message,
  SelectPicker,
  Checkbox,
  CheckboxGroup,
  Radio,
  RadioGroup,
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
                  <table className={styles.subscriptionTable}>
                    <thead>
                      <tr>
                        <th>Features</th>
                        <th>Free</th>
                        <th>Premium</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>User Limit</td>
                        <td>5</td>
                        <td>Unlimited</td>
                      </tr>
                      <tr>
                        <td>Storage</td>
                        <td>1GB</td>
                        <td>100GB</td>
                      </tr>
                      <tr>
                        <td>Support</td>
                        <td>Email</td>
                        <td>Priority</td>
                      </tr>
                    </tbody>
                  </table>

                  <Field name="subscription">
                    {({ input, meta }) => (
                      <FormField name="subscription" label="Subscription" needErrorMessage={true}>
                        <FormSuite.Control
                          {...input}
                          accepter={RadioGroup}
                          inline
                          error={meta.touched && meta.error}
                          errorMessage={meta.touched && meta.error}
                          required
                        >
                          <Radio value="free">Free</Radio>
                          <Radio value="premium">Premium</Radio>
                        </FormSuite.Control>
                      </FormField>
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
