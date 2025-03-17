import React, { useState } from "react";
import { Modal, Loader, Message, useToaster } from "rsuite";
import { Form, Field } from "react-final-form";
import {
  FormButtonToolbar,
  FormField,
} from "@pet-management-webapp/shared/ui/ui-basic-components";
import FormSuite from "rsuite/Form";
import { getConfig } from "@pet-management-webapp/business-admin-app/util/util-application-config-util";

export const SignUp = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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

  return (
    <Modal open={open} onClose={onClose} size="xs">
      <Modal.Header style={{ marginTop: 10, textAlign: "center" }}>
        <Modal.Title>Sign Up</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form
          onSubmit={handleSignUp}
          validate={validate}
          render={({ handleSubmit }) => (
            <FormSuite
              layout="vertical"
              onSubmit={() => {
                handleSubmit();
              }}
              fluid
            >
              <FormField name="email" label="Email">
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

              <FormField name="firstName" label="First Name">
                <FormSuite.Control name="firstName" required />
              </FormField>

              <FormField name="lastName" label="Last Name">
                <FormSuite.Control name="lastName" required />
              </FormField>

              <FormField name="organizationName" label="Organization Name">
                <FormSuite.Control name="organizationName" required />
              </FormField>

              <FormButtonToolbar
                submitButtonText="Sign Up"
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
