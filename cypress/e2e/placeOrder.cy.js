describe("Place Order", () => {

    beforeEach(() => {
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

        // click the "Sign In" button
        cy.contains("Sign in").should("be.visible").click()

        // fill in the login form
        cy.get("input[name='email']").type("chathushkatester@gmail.com")
        cy.get("input[name='password']").type("Tester@1234")

        // click the "Sign In" button
        cy.contains("button", "Sign in").should("be.visible").click()
    })

    it("should add item to cart", () => {

        // click the "Restaurants" link
        cy.contains("Restaurants").should("be.visible").click()

        // click the first restaurant link
        cy.contains("button", "View Menu").first().click()

        // verify navigated to the restaurant details page
        cy.url().should("include", "/restaurant/")

        // click the first meal link
        cy.contains("button", "Add to Cart").first().click()

        // click the "Cart" link
        cy.get("[data-cy='cart-button']").click()

        // verify navigated to the cart page
        cy.url().should("include", "/cart")
    })
})