Cypress.Commands.add('loginAs', (email, password = 'Secret123!') => {
    return cy.request('POST', `${Cypress.env('apiUrl')}/auth/login`, { email, password })
        .then(res => {
            const token = res.body.accessToken
            expect(token, 'JWT present').to.be.a('string')
            Cypress.env('token', token)
            // (Optional) if frontend expects storage:
            // window.localStorage.setItem('token', token)
            return token
        })
})

Cypress.Commands.add('authVisit', (path, {
    email,
    password = 'Secret123!'
} = {}) => {
    const api = Cypress.env('apiUrl')

    // 1) Get a real token + user from backend
    return cy.request('POST', `${api}/auth/login`, { email, password }).then(res => {
        const token = res.body.accessToken
        const user = res.body.user
        // sanity checks
        expect(token, 'JWT present').to.be.a('string')
        expect(user, 'user present').to.be.an('object')
        expect(user).to.have.property('role')  // your ProtectedRoute likely needs this

        // 2) Visit route and inject storage BEFORE app loads
        cy.visit(path, {
            onBeforeLoad(win) {
                win.localStorage.setItem('user', JSON.stringify(user))
                win.localStorage.setItem('token', token)
                // (optional) notify same-tab listeners, mirrors your AuthProvider
                win.dispatchEvent(new Event('auth:changed'))
            }
        })
    })
})

