Cypress.Commands.add('mockApi', () => {
  cy.fixture('products').then(products => {
    cy.intercept('GET', '/api/products', { body: products }).as('getProducts')
    cy.intercept('GET', '/api/products/*', { body: products[0] }).as('getProduct')
  })

  cy.fixture('rawMaterials').then(materials => {
    cy.intercept('GET', '/api/raw-materials', { body: materials }).as('getRawMaterials')
  })

  cy.fixture('suggestions').then(suggestions => {
    cy.intercept('GET', '/api/production/suggested', { body: suggestions }).as('getSuggestions')
  })
})

Cypress.Commands.add('goToProducts', () => {
  cy.mockApi()
  cy.visit('/products')
  cy.wait('@getProducts')
  cy.wait('@getRawMaterials')
})

Cypress.Commands.add('goToMaterials', () => {
  cy.mockApi()
  cy.visit('/materials')
  cy.wait('@getRawMaterials')
})

Cypress.Commands.add('goToDashboard', () => {
  cy.mockApi()
  cy.visit('/')
  cy.wait('@getSuggestions')
})

Cypress.Commands.add('fillProductForm', ({ name, price }) => {
  cy.contains('button', /Novo Produto/i).click()
  cy.get('input[placeholder*="Produto Alpha"]').type(name)
  cy.get('input[placeholder="0.00"]').type(String(price))
})

Cypress.Commands.add('fillMaterialForm', ({ name, quantity }) => {
  cy.contains('button', /Nova Matéria-Prima/i).click()
  cy.get('input[placeholder*="Aço carbono"]').type(name)
  cy.get('input[placeholder="0"]').type(String(quantity))
})
