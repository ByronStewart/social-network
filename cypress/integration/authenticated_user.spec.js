describe("authenticated users", () => {
  
  it("should be able to login", () => {
    cy.visit("/login")
    cy.get('input[name="username"]').type('joe')
    cy.get('input[name="password"]').type('joe')
    cy.contains('button','Login').click()
  })

  it("should be able to logout",  ()=> {

  })

  context("logged in", () => {
    beforeEach(() => {
      //TODO
      //cy.login()
    })
  })
  it("should be able to create a post", () => {

  })

  it("should not be able to create an empty post", () => {

  })

  it("should be able to like a post", () => {

  })
  
  it("should be able to unlike a post", () => {

  })

  it("should be able to edit a post", () => {

  })
  
  it("should not be able to edit another users posts", () => {

  })

  it("should be able to follow a user", () => {

  })

  it("should not be able to follow themselves", () => {

  })
})