describe('Course CRUD – Full Stack', () => {
    const api = Cypress.env('apiUrl')
    const timestamp = Date.now()
    const courseData = {
        title: `E2E Test Course ${timestamp}`,
        description: 'End-to-end test course description',
        category: 'Automation',
        level: 'beginner'
    }

    before(() => {
        cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, {
            email: 'faculty@example.com',
            password: 'Secret123!'
        }).then(res => {
            expect(res.status).to.eq(200)
            Cypress.env('token', res.body.accessToken)
        })
    })



    it('creates a new course via API (backend)', () => {
        cy.log('Using token:', Cypress.env('token'))
        cy.request({
            method: 'POST',
            url: `${api}/courses`,
            headers: {
                Authorization: `Bearer ${Cypress.env('token')}`
            },
            body: courseData
        })
            .its('status')
            .should('eq', 201)
    })

    it('verifies created course appears in frontend (UI)', () => {
        cy.visit('/courses')
        cy.contains(courseData.title, { timeout: 5000 }).should('be.visible')
    })

    it('confirms update via backend', () => {
        cy.request({
            method: 'GET',
            url: `${api}/courses`,
            headers: {
                Authorization: `Bearer ${Cypress.env('token')}`
            }
        }).then(res => {
            const found = res.body.find(c => c.title === courseData.title)
            expect(found).to.exist
        })
    })

    it('deletes the course via API (backend cleanup)', () => {
        cy.request({
            method: 'GET',
            url: `${api}/courses`,
            headers: { Authorization: `Bearer ${Cypress.env('token')}` }
        }).then(res => {
            const target = res.body.find(c => c.title === courseData.title)
            if (target?._id) {
                cy.request({
                    method: 'DELETE',
                    url: `${api}/courses/${target._id}`,
                    headers: { Authorization: `Bearer ${Cypress.env('token')}` }
                })
                    .its('status')
                    .should('eq', 200)
            }
        })
    })
})
