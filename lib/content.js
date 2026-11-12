import productsFile from "../data/products.json";
import servicesFile from "../data/services.json";
import store from "../data/store.json";

export { store };

export const services = servicesFile.services.map((service) => ({
  ...service,
  image:
    service.id === "braids"
      ? "/images/braids-card.jpg"
      : service.id === "manicure"
        ? "/images/manicure-card.jpg"
        : "/images/pedicure-card.jpg"
}));

export const products = productsFile.products.map((product) => ({
  ...product,
  image: `/${product.image}`
}));

export const featured = ["starfruit-sangria", "bali-mango", "waikiki-coconut"]
  .map((id) => products.find((product) => product.id === id))
  .filter(Boolean);
