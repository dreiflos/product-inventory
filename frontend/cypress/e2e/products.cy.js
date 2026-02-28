describe('Products Page', () => {

  beforeEach(() => {
    cy.goToProducts()
    cy.contains('Widget Alpha').should('be.visible')
  })

  it('should display the page title', () => {
    cy.contains('Produtos Acabados').should('be.visible')
  })

  it('should display products loaded from the API', () => {
    cy.contains('Widget Alpha').should('be.visible')
    cy.contains('Widget Beta').should('be.visible')
  })

  it('should display product prices', () => {
    cy.contains('R$ 150.00').should('be.visible')
    cy.contains('R$ 80.00').should('be.visible')
  })

  it('should display composition count badge', () => {
    cy.contains('1 insumos').should('be.visible')
    cy.contains('0 insumos').should('be.visible')
  })

  it('should open create modal on "Novo Produto" click', () => {
    cy.contains('button', /Novo Produto/i).click()
    cy.contains('h2', 'Novo Produto').should('be.visible')
  })

  it('should show validation error when submitting empty form', () => {
    cy.contains('button', /Novo Produto/i).click()
    cy.contains('h2', 'Novo Produto').should('be.visible')
    cy.contains('button', 'Criar Produto').should('be.visible').click()
    cy.contains('Nome é obrigatório').should('be.visible')
  })

  it('should create a product and close the modal', () => {
    const newProduct = { id: 99, name: 'Widget Gamma', price: 250, compositions: [] }
    cy.intercept('POST', '/api/products', { statusCode: 201, body: newProduct }).as('createProduct')

    cy.fillProductForm({ name: 'Widget Gamma', price: 250 })
    cy.contains('button', 'Criar Produto').click()

    cy.wait('@createProduct').then(interception => {
      expect(interception.request.body.name).to.eq('Widget Gamma')
      expect(Number(interception.request.body.price)).to.eq(250)
    })

    cy.contains('h2', 'Novo Produto').should('not.exist')
  })

  it('should open edit modal with pre-filled data', () => {
    cy.get('[title="Editar"]').should('be.visible').first().click()
    cy.contains('h2', 'Editar Produto').should('be.visible')
    cy.get('input[placeholder="Ex: Produto Alpha"]').should('have.value', 'Widget Alpha')
    cy.get('input[placeholder="0.00"]').should('have.value', '150')
  })

  it('should update a product via the edit modal', () => {
    const updated = { id: 1, name: 'Widget Alpha V2', price: 175, compositions: [] }
    cy.intercept('PUT', '/api/products/1', { statusCode: 200, body: updated }).as('updateProduct')

    cy.get('[title="Editar"]').should('be.visible').first().click()
    cy.contains('h2', 'Editar Produto').should('be.visible')

    cy.get('input[placeholder="Ex: Produto Alpha"]').clear().type('Widget Alpha V2')
    cy.contains('button', 'Salvar Alterações').click()

    cy.wait('@updateProduct').then(interception => {
      expect(interception.request.body.name).to.eq('Widget Alpha V2')
    })

    cy.contains('h2', 'Editar Produto').should('not.exist')
  })

  it('should open confirm modal when clicking delete', () => {
    cy.get('[title="Excluir"]').should('be.visible').first().click()
    cy.contains('Confirmar exclusão').should('be.visible')
    cy.contains('Widget Alpha').should('be.visible')
  })

  it('should cancel deletion and keep the product', () => {
    cy.get('[title="Excluir"]').should('be.visible').first().click()
    cy.contains('Confirmar exclusão').should('be.visible')
    cy.contains('button', 'Cancelar').click()
    cy.contains('Confirmar exclusão').should('not.exist')
    cy.contains('Widget Alpha').should('be.visible')
  })

  it('should delete a product on confirm', () => {
    cy.intercept('DELETE', '/api/products/1', { statusCode: 204 }).as('deleteProduct')

    cy.get('[title="Excluir"]').should('be.visible').first().click()
    cy.contains('Confirmar exclusão').should('be.visible')
    cy.get('.fixed').contains('button', 'Excluir').click()

    cy.wait('@deleteProduct')
  })

  it('should expand composition panel on badge click', () => {
    cy.contains('1 insumos').click()
    cy.contains('Composição de Insumos').should('be.visible')
    cy.contains('Steel').should('be.visible')
  })

  it('should add a composition to a product', () => {
    const newComp = { id: 99, rawMaterialId: 3, rawMaterialName: 'Plastic', requiredQuantity: 2 }
    cy.intercept('POST', '/api/products/1/compositions', { statusCode: 201, body: newComp }).as('addComp')

    cy.contains('1 insumos').click()
    cy.contains('Composição de Insumos').should('be.visible')

    cy.get('select').select('3')
    cy.get('input[placeholder="Qtd"]').type('2')
    cy.contains('button', 'Add').click()

    cy.wait('@addComp').then(interception => {
      expect(interception.request.body.rawMaterialId).to.eq(3)
      expect(Number(interception.request.body.quantity)).to.eq(2)
    })
  })
})
