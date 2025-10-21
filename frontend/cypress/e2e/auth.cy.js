describe('Auth flow', () => {
  it('logs in learner and shows dashboard', () => {
    cy.visit('/login')
    cy.get('input[placeholder="Email"]').clear().type('learner@example.com')
    cy.get('input[placeholder="Password"]').clear().type('Secret123!')
    cy.contains('Sign In').click()
    cy.url().should('include', '/me')
    cy.contains('Learner Dashboard')
  })
})
