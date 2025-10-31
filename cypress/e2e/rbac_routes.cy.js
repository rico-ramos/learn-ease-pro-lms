describe('RBAC route protection', () => {
    it('learner cannot hit faculty routes (403/redirect)', () => {
        cy.authVisit('/faculty', { email: 'learner@example.com' })
        cy.location('pathname', { timeout: 8000 }).should('not.include', '/faculty')
    })

    it('faculty can open course management', () => {
        cy.authVisit('/faculty', { email: 'faculty@example.com' })
        cy.location('pathname', { timeout: 8000 }).should('include', '/faculty')
        cy.contains(/course management|manage courses|\+?\s*new course/i, { timeout: 8000 }).should('be.visible')
    })

    it('admin can open admin dashboard', () => {
        cy.authVisit('/admin', { email: 'admin@example.com' })
        cy.location('pathname', { timeout: 8000 }).should('include', '/admin')
        cy.contains(/admin dashboard/i, { timeout: 8000 }).should('be.visible')
    })
})
