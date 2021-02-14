/* eslint-disable no-undef */
describe('Profile', () => {
  beforeEach(() => {
    cy.visit(`${Cypress.config().baseUrl}/p/raphael`);
  });

  // user logged in & not logged in (follow/unfollow with mocks)

  it('goes to a profile page and validates the UI', () => {
    cy.get('body').within(() => {
      cy.get('div').should('contain.text', 'raphael');
      cy.get('div').should('contain.text', 'Raffaello Sanzio da Urbino');
      cy.get('div').should('contain.text', '5 photos');
      cy.get('div').should('contain.text', '2 followers');
      cy.get('div').should('contain.text', '0 following');

      // further tasks, check for images + alt tags
      // check for user profile photo
    });
  });
});
