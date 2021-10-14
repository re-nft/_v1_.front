
// different file for mocking
describe("lend page no wallet", () => {

    it("it shows wallet connect message", () => {})
})

describe("lend page wallet connected", () => {

    it('renders empty item when no item returned by API', () => {})
    it('renders empty item when API is down with error message', () => {})
    it('renders item with empty empty amount', () => {})
    it('renders refresh button when amount is not loaded', () => {})
    it('renders item erc721, erc1555 with right details returned by API', () => {})
    it('show images when returned', () => {})
    it('shows empty placeholders when returned', () => {})
    it('renders clickable items', () => {})
    it("won't render items that lended out", () => {})
    it("can't select items with 0 amount", () => {})

describe("lend form open", () => {

    it('show lend form when 1 item selected with item details', () => {})
    it('show lend form when 2 item selected with selected items details', () => {})
    it('shows filled out details when modal was filled before (1 item)', () => {})
    it('shows filled out details when modal was filled before (multiple item)', () => {})
    it('when items selected and filled out and item lended out (form closed/form opened) form does not show it', () => {})

  })

  describe("filter", () => {
    //todo
    it('filter items out based on collection name', () => {})
    it('filter shows only matches', () => {})
    it('filter dropdown shows all available options in dropdown', () => {})
    it('filter dropdown empty filter shows all items based on page', () => {})
  });

  describe('filter + paging works together (multiple case)', () => {})
  describe('filter + sort works together (multiple case)', () => {})
  describe('sort + paging works together (multiple case)', () => {})
  describe('filter + sort + paging works together (multiple case)', () => {})
  describe("sort", () => {
    //todo
    it("sort reset sorts based on nId by default", () => {})
    it("sorts items based on rental date desc", () => {})
    it("sorts items based on rental date asc", () => {})
    it("sorts items based on collateral desc", () => {})
    it("sorts items based on collateral asc", () => {})
    it("sorts items based on daily rent price desc", () => {})
    it("sorts items based on daily rent price desc", () => {})
  });
  describe("paging", () => {

    it('show items based on page number based on initial sort', () => {})
    it('items are not duplicated between pages', () => {})
    it('prev page works as intended', () => {})
    it('next page works as intended', () => {})
    it('page jump works as intended', () => {})

  })

})
