describe('Production Dashboard', () => {

  beforeEach(() => {
    cy.goToDashboard()
  })

  it('should display the page title', () => {
    cy.contains('Sugestão de').should('be.visible')
    cy.contains('Produção').should('be.visible')
  })

  it('should display suggested product names', () => {
    cy.contains('Widget Alpha').should('be.visible')
    cy.contains('Widget Beta').should('be.visible')
  })

  it('should display production quantities', () => {
    cy.contains('20').should('be.visible')
    cy.contains('5').should('be.visible')
  })

  it('should display subtotals for each product', () => {
    cy.contains('R$ 3.000,00').should('be.visible')
    cy.contains('R$ 400,00').should('be.visible')
  })

  it('should display total estimated revenue', () => {
    cy.contains('R$ 3.400,00').should('be.visible')
  })

  it('should display total units to produce', () => {
    cy.contains('25').should('be.visible')
  })

  it('should display best product in KPI card', () => {
    cy.contains('Produto Destaque').should('be.visible')
    cy.contains('Widget Alpha').should('be.visible')
  })

  it('should mark highest value product with "Top" badge', () => {
    cy.contains('Top').should('be.visible')
  })

  it('should mark other products with "Produzir" badge', () => {
    cy.contains('Produzir').should('be.visible')
  })

  it('should refresh suggestions when clicking Atualizar', () => {
    cy.fixture('suggestions').then(suggestions => {
      cy.intercept('GET', '/api/production/suggested', { body: suggestions }).as('refresh')
    })

    cy.contains('button', /Atualizar/i).click()
    cy.wait('@refresh')
    cy.contains('Widget Alpha').should('be.visible')
  })

  it('should show empty message when no suggestions available', () => {
    cy.intercept('GET', '/api/production/suggested', {
      body: { suggestedItems: [], totalEstimatedValue: 0 }
    }).as('emptySuggestions')

    cy.visit('/')
    cy.wait('@emptySuggestions')

    cy.contains('nenhuma sugestão disponível').should('be.visible')
  })
})
