describe('Navigation', () => {

  beforeEach(() => {
    cy.mockApi()
    cy.visit('/')
  })

  it('should display the sidebar with all menu items', () => {
    cy.contains('Dashboard de Produção').should('be.visible')
    cy.contains('Produtos Acabados').should('be.visible')
    cy.contains('Matérias-Primas').should('be.visible')
  })

  it('should display the Autoflex ERP brand in sidebar', () => {
    cy.contains('Autoflex').should('be.visible')
    cy.contains('ERP').should('be.visible')
  })

  it('should navigate to Products page via sidebar', () => {
    cy.contains('Produtos Acabados').click()
    cy.url().should('include', '/products')
    cy.contains('Produtos Acabados').should('be.visible')
  })

  it('should navigate to Raw Materials page via sidebar', () => {
    cy.contains('Matérias-Primas').click()
    cy.url().should('include', '/materials')
    cy.contains('Matérias Primas').should('be.visible')
  })

  it('should navigate back to Dashboard via sidebar', () => {
    cy.contains('Produtos Acabados').click()
    cy.contains('Dashboard de Produção').click()
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.contains('Sugestão de').should('be.visible')
  })

  it('should highlight the active menu item', () => {
    cy.contains('Produtos Acabados').click()
    cy.contains('Produtos Acabados')
      .should('have.class', 'text-[#00c896]')
  })

  it('should show online status indicator', () => {
    cy.get('.dot-live').should('be.visible')
    cy.contains('Online').should('be.visible')
  })
})
