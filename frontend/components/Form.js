import React, { useState, useEffect } from "react";
import * as yup from "yup";

// Initial form values
const initialFormValues = {
  fullName: "",
  size: "",
  toppings: [],
};

// Initial form errors
const initialFormErrors = {
  fullName: "",
  size: "",
};

// Form validation schema
const formSchema = yup.object().shape({
  fullName: yup
    .string()
    .required("full name is required")
    .min(3, "full name must be at least 3 characters"),
  size: yup.string().required("size must be S or M or L"),
});

export default function Form() {
  const [formValues, setFormValues] = useState(initialFormValues);
  const [formErrors, setFormErrors] = useState(initialFormErrors);
  const [isDisabled, setIsDisabled] = useState(true);
  const [message, setMessage] = useState("");

  // UseEffect to check if the form is valid after each change
  useEffect(() => {
    const checkValidity = async () => {
      const valid = await formSchema.isValid(formValues);
      setIsDisabled(!valid);
    };
    checkValidity();
  }, [formValues]);

  // Handle input changes with validation
  const onChange = async (evt) => {
    const { name, value, type, checked } = evt.target;

    // Remove any extra spaces in the name field
    let newValue = value;
    if (name === "fullName") {
      newValue = value.trim();
    }

    // Handle checkbox (toppings) updates
    if (type === "checkbox") {
      let newToppings;
      if (checked) {
        newToppings = [...formValues.toppings, name];
      } else {
        newToppings = formValues.toppings.filter((t) => t !== name);
      }
      const newValues = { ...formValues, toppings: newToppings };
      setFormValues(newValues);
    } else {
      const newValues = { ...formValues, [name]: newValue };
      setFormValues(newValues);
    }

    // Validate fields if they exist in the schema (fullName, size)
    if (["fullName", "size"].includes(name)) {
      try {
        // Validate trimmed value for fullName
        await yup.reach(formSchema, name).validate(newValue);
        setFormErrors({ ...formErrors, [name]: "" });
      } catch (err) {
        setFormErrors({ ...formErrors, [name]: err.message });
      }
    }
  };

  // Handle form submission
  const onSubmit = async (evt) => {
    evt.preventDefault();
    try {
      await formSchema.validate(formValues, { abortEarly: false });
      setMessage(
        `Thank you for your order, ${formValues.fullName}!\nYour ${
          formValues.size === "S"
            ? "small"
            : formValues.size === "M"
            ? "medium"
            : "large"
        } pizza ${
          formValues.toppings.length > 0
            ? `with ${formValues.toppings.length} topping${
                formValues.toppings.length > 1 ? "s" : ""
              }`
            : "with no toppings"
        } is on the way!`
      );
      setFormValues(initialFormValues);
      setFormErrors(initialFormErrors);
      setIsDisabled(true);
    } catch (err) {
      const errors = {};
      err.inner.forEach((e) => {
        errors[e.path] = e.message;
      });
      setFormErrors(errors);
      setIsDisabled(true);
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <h2>Order Your Pizza</h2>

      <div className="input-group">
        <div>
          <label htmlFor="fullName">Full Name</label>
          <br />
          <input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Type full name"
            value={formValues.fullName}
            onChange={onChange}
          />
          {formErrors.fullName && (
            <p className="error">{formErrors.fullName}</p>
          )}
        </div>
      </div>

      <div className="input-group">
        <div>
          <label htmlFor="size">Size</label>
          <br />
          <select
            id="size"
            name="size"
            value={formValues.size}
            onChange={onChange}
          >
            <option value="">----Choose Size----</option>
            <option value="S">Small</option>
            <option value="M">Medium</option>
            <option value="L">Large</option>
          </select>
          {formErrors.size && <p className="error">{formErrors.size}</p>}
        </div>
      </div>

      <div className="input-group">
        {["Pepperoni", "Green Peppers", "Pineapple", "Mushrooms", "Ham"].map(
          (topping) => (
            <label key={topping}>
              <input
                type="checkbox"
                name={topping}
                checked={formValues.toppings.includes(topping)}
                onChange={onChange}
              />
              {topping}
              <br />
            </label>
          )
        )}
      </div>

      <input type="submit" disabled={isDisabled} />

      {message && (
        <div id="message">
          {message.split("\n").map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
      )}
    </form>
  );
}
