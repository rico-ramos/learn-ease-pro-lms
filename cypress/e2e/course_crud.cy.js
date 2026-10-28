describe('Course CRUD – Full Stack', () => {
    const api = Cypress.env('apiUrl');
    const title = `E2E Test Course ${Date.now()}`;
    const courseData = {
        title,
        description: 'End-to-end test course description',
        category: 'Automation',
        level: 'beginner'
    };
    let token;
    let createdCourse;

    const authHeaders = () => ({ Authorization: `Bearer ${token}` });

    before(() => {
        cy.request('POST', `${api}/auth/login`, {
            email: 'faculty@example.com',
            password: 'Secret123!'
        }).then(({ status, body }) => {
            expect(status).to.eq(200);
            token = body.accessToken;
            expect(token).to.be.a('string').and.not.be.empty;
        });
    });

    // Clean up even if a later assertion fails (so reruns don't leave test data).
    after(() => {
        if (!createdCourse?._id || !token) return;
        cy.request({
            method: 'DELETE',
            url: `${api}/courses/${createdCourse._id}`,
            headers: authHeaders(),
            failOnStatusCode: false
        }).then(({ status }) => {
            expect([200, 404]).to.include(status);
        });
    });

    it('creates and publishes a course via API', () => {
        cy.request({
            method: 'POST',
            url: `${api}/courses`,
            headers: authHeaders(),
            body: courseData
        }).then(({ status, body }) => {
            expect(status).to.eq(201);
            expect(body._id).to.be.a('string');
            expect(body.slug).to.be.a('string');
            createdCourse = body;

            // New courses are drafts; publish before asserting public visibility.
            cy.request({
                method: 'PATCH',
                url: `${api}/courses/${createdCourse.slug}`,
                headers: authHeaders(),
                body: { isPublished: true }
            }).then(({ status, body }) => {
                expect(status).to.eq(200);
                expect(body.isPublished).to.eq(true);
            });
        });
    });

    it('shows the published course in the public catalog', () => {
        cy.visit('/courses');
        cy.contains(title, { timeout: 10000 }).should('be.visible');
    });

    it('updates the course and confirms the change was persisted', () => {
        const updatedDescription = `Updated by Cypress ${Date.now()}`;
        cy.request({
            method: 'PATCH',
            url: `${api}/courses/${createdCourse.slug}`,
            headers: authHeaders(),
            body: { description: updatedDescription }
        }).then(({ status, body }) => {
            expect(status).to.eq(200);
            expect(body.description).to.eq(updatedDescription);
        });

        cy.request({
            method: 'GET',
            url: `${api}/courses/${createdCourse.slug}`
        }).then(({ status, body }) => {
            expect(status).to.eq(200);
            expect(body.description).to.eq(updatedDescription);
        });
    });

    it('deletes the course via API', () => {
        cy.request({
            method: 'DELETE',
            url: `${api}/courses/${createdCourse._id}`,
            headers: authHeaders()
        }).then(({ status }) => {
            expect(status).to.eq(200);
            createdCourse = null;
        });
    });
});
