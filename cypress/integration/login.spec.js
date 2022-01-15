
describe("login page tests", () => {
  beforeEach(()=> {
    cy.fixture("empty.json")
    .should("have.length", 4)
    .then(db => db.filter(user => user.model === "network.user").map(user => ({
      username: user.fields.username,
      password: user.fields.username
  })))
    .as("users")
  })
  it("should login with a username and password", () => {
    cy.fixture("empty.json")
      .should("have.length", 4)
      .then(db => db.filter(user => user.model === "network.user").map(user => ({
        username: user.fields.username,
        password: user.fields.username
    })))
      .as("users")
    cy.visit("/login")
    cy.get("@users").then(users => {
      cy.findByTestId("username-field").type(users[0].username)
      cy.findByTestId("password-field").type(users[0].password)
    })
    cy.findByTestId("login-button").click()
    cy.getCookie("sessionid").should("exist")
    cy.getCookie("csrftoken").should("exist")
  })

})