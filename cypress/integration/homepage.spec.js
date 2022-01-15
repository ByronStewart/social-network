/// <reference types="Cypress" />

describe("homepage tests", ()=> {
  context("not logged in", () => {
    it("should display a list of posts", () => {
      cy.visit("/")
    })
  })
})