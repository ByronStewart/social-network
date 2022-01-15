// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

import "@testing-library/cypress/add-commands";

Cypress.Commands.add("login", (username, password) => {
  cy.visit("/login");
  cy.get("[name=csrfmiddlewaretoken]")
    .should("exist")
    .and("have.attr", "value")
    .as("csrfToken");
  cy.get("@csrfToken").then((token) => {
    cy.request({
      method: "POST",
      url: "/login",
      form: true,
      body: {
        username,
        password,
      },
      headers: {
        "X-CSRFTOKEN": token,
      },
    });
  });
  cy.getCookie("sessionid").should("exist");
  cy.getCookie("csrftoken").should("exist");
});
