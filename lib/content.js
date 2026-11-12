import productsFile from "../data/products.json";
import servicesFile from "../data/services.json";
import store from "../data/store.json";

export { store };

export const services = servicesFile.services.map((service) => ({
  ...service,
  image:
    service.id === "braids"
      ? "/images/braids.jpg"
      : service.id === "manicure"
        ? "/images/manicure.jpg"
        : "/images/pedicure.jpg"
}));

export const products = productsFile.products.map((product) => ({
  ...product,
  image: `/${product.image}`
}));

export const featured = ["canada-shelf", "st-ives-citrus", "olay-peach", "nivea-lotion"]
  .map((id) => products.find((product) => product.id === id))
  .filter(Boolean);
