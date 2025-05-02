describe("Register and Login", () => {

  it("should register a new user", () => {

    cy.visit("/register")

    // fill in the registration form
    cy.get("input[name='firstName']").type("Chathushka")
    cy.get("input[name='lastName']").type("Tester")
    cy.get("input[name='email']").type("chathushkatester@gmail.com")
    cy.get("input[name='phone']").type("0771234567")
    cy.get("input[name='password']").type("Tester@1234")
    cy.get("input[name='confirmPassword']").type("Tester@1234")
    cy.get("input[name='terms']").check()

    // click the "Create Account" button
    cy.contains("button", "Create Account").should("be.visible").click()

  })

  it("should login with existing user", () => {

    cy.visit("/login")

    // fill in the login form
    cy.get("input[name='email']").type("chathushkatester@gmail.com")
    cy.get("input[name='password']").type("Tester@1234")

    // click the "Sign In" button
    cy.contains("button", "Sign in").should("be.visible").click()

  })

})