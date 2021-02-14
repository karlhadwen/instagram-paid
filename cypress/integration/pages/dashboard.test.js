/* eslint-disable no-undef */
describe('Dashboard', () => {
  beforeEach(() => {
    cy.visit(`${Cypress.config().baseUrl}/login`);

    cy.get('body').within(() => {
      cy.get('div').should('contain.text', "Don't have an account? Sign up");
    });
    cy.get('div')
      .find('img')
      .should('be.visible')
      .should('have.attr', 'alt')
      .should('contain', 'iPhone with Instagram app');

    cy.get('form').within(() => {
      cy.get('input:first')
        .should('have.attr', 'placeholder', 'Email address')
        .type('karlhadwen@gmail.com');
      cy.get('input:last').should('have.attr', 'placeholder', 'Password').type('test123');
      cy.get('button').should('contain.text', 'Login');
      cy.get('button').click();
    });

    cy.get('div')
      .find('img')
      .should('be.visible')
      .should('have.attr', 'alt')
      .should('contain', 'Instagram');
  });

  it('logs the user in and shows the dashboard and does basic checks around the UI', () => {
    cy.get('body').within(() => {
      cy.get('div').should('contain.text', 'karl'); // username in the sidebar
      cy.get('div').should('contain.text', 'Karl Hadwen'); // full name in the sidebar
      cy.get('div').should('contain.text', 'Suggestions for you'); // if user has suggestions
    });
  });

  it('logs the user in and add a comment to a photo', () => {
    cy.get('[data-testid="add-comment-494LKmaF03bUcYZ4xhNu"]')
      .should('have.attr', 'placeholder', 'Add a comment...')
      .type('Amazing photo!');
    cy.get('[data-testid="add-comment-submit-494LKmaF03bUcYZ4xhNu"]').submit();
  });

  it('logs the user in and likes a photo', () => {
    cy.get('[data-testid="like-photo-494LKmaF03bUcYZ4xhNu"]').click();
  });

  it('logs the user in and then signs out', () => {
    cy.get('[data-testid="sign-out"]').click();
    cy.get('div').should('contain.text', "Don't have an account? Sign up"); // back on the login page
  });
});
