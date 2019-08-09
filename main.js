const { render } = ReactDOM
const { HashRouter, Switch, Link, Route, Redirect } = ReactRouterDOM
const API = 'https://acme-users-api-rev.herokuapp.com/api'

/* components */

const Header = () => {
    return (
        <header>
            <h1>Acme Product Averages (React)</h1>
        </header>
    )
}

const Nav = ({ location }) => {
    return (
        <nav className="nav">
            <Link to='/' className={location.pathname === '/' ? 'active' : ''}>Home</Link>
            <Link to='/products' className={location.pathname === '/products' ? 'active' : ''}>Products</Link>
        </nav>
    )
}

/* views */

const Home = ({ products }) => {
    const count = products.length
    const avgPice = products.reduce((acc, curr) => acc + curr.suggestedPrice, 0) / count
    return (
        <div id="home">
            <h3>Home</h3>
            <p>We have {count} products with an average price of ${avgPice.toFixed(2)}</p>
        </div>
    )
}

const Products = ({ products, companies, offerings }) => {
    return (
        <div id="products">
            <h3>Products</h3>
            <div id="products-list">{
                products.map(product => {
                    const productOfferings = offerings.filter(offering => offering.productId === product.id)
                    const avgPrice = (productOfferings.reduce((acc, curr) => acc + curr.price, 0) / productOfferings.length).toFixed(2)
                    const lowestPrice = Math.min(...productOfferings.map(offer => offer.price))
                    const lowestPriceOfferer = companies.find(company => company.id === productOfferings.find(offer => offer.price === lowestPrice).companyId).name
                    return (
                        <div key={product.id}>
                            <p>
                                <span className="txt-bold">Product: </span>
                                <span className="txt-uppercase">{product.name}</span>
                            </p>
                            <p>
                                <span className="txt-bold">Suggested Price: </span>
                                <span>${product.suggestedPrice.toFixed(2)}</span>
                            </p>
                            <p>
                                <span className="txt-bold">Average Price: </span>
                                <span>${avgPrice}</span>
                            </p>
                            <p>
                                <span className="txt-bold">Lowest Price: </span>
                                <span>${lowestPrice} offered by {lowestPriceOfferer}</span>
                            </p>
                        </div>
                    )
                })
            }</div>
        </div>
    )
}

/* main app */
class App extends React.Component {
    constructor() {
        super()
        this.state = {
            products: []
        }
    }
    componentDidMount() {
        /* api calls */
        Promise.all([
            axios.get(`${API}/products`),
            axios.get(`${API}/companies`),
            axios.get(`${API}/offerings`)
        ]).then(([products, companies, offerings]) => {
            this.setState({
                products: products.data,
                companies: companies.data,
                offerings: offerings.data
            });
        })
    }
    render() {
        const { products } = this.state
        return (
            <HashRouter>
                <Header />
                <Route component={Nav} />
                <Switch>
                    <Route exact path='/' render={() => <Home products={products} />} />
                    <Route path='/products' render={() => <Products {...this.state} />} />
                    <Redirect to="/" />
                </Switch>
            </HashRouter>
        )
    }
}
const root = document.querySelector('#root')
render(<App />, root)