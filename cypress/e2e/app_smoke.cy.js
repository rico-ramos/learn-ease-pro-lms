describe('LEARN EASE PRO LMS Smoke Test', () => {
    it('visits home page', () => {
        cy.visit('/')
        cy.contains('LEARN EASE PRO').should('be.visible')
    })

    it('can access login page and log in as faculty', () => {
        cy.visit('/login')
        cy.get('input[name="email"]').clear().type('faculty@example.com')
        cy.get('input[name="password"]').clear().type('Secret123!')
        cy.get('button[type="submit"]').click()

        // Verify redirect to faculty dashboard
        cy.url().should('include', '/faculty')
    })

    it('API health check', () => {
        cy.request(Cypress.env('apiUrl') + '/health')
            .its('status')
            .should('eq', 200)
    })
})
