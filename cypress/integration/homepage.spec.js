/// <reference types="Cypress" />
/// <reference types="@testing-library/cypress" />

/**
 * Expected to be run on a clean empty database
 */
describe("No user logged in", () => {
  before(() => {
    cy.visit("/");
    cy.clearCookies();
  });
  it("Should not have a create new post form", () => {
    cy.pause();
    cy.get("#create-new-post-form").should("not.exist");
  });
  it("should not be able to like a post", () => {
    
  });
});

describe("User logged in", () => {
  before(() => {
    cy.login("alice", "alice");
    cy.visit("/");
  });
  beforeEach(() => {
    Cypress.Cookies.preserveOnce("sessionid", "csrftoken");
  });
  it("Should display the create new post form", () => {
    cy.findByTestId("create-new-post-form").should("exist");
  });

  it("Should post the form to the backend and respond with 201", () => {
    cy.intercept("POST", "/api/posts/new").as("newPost");
    cy.findByTestId("post-content-input").type("what the fuck{enter}");
    cy.wait("@newPost").its("response.statusCode").should("eq", 201);
  });

  it("Should display the new post at the top of the post list", () => {
    const postText = "cool story bro";
    cy.findByTestId("post-content-input").type(postText + "{enter}");
    cy.get("#post-list").children().first().should("contain", postText);
  });
  after(() => {
    cy.clearCookies();
  });
});
