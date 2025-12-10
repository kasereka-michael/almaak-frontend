import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import debounce from "lodash.debounce";
import {
  createProduct,
  updateProduct,
  getProductById,
  searchProductByPartNumber,
} from "../../services/api";

const ProductForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    sku: "",
    partNumber: "",
    category: "",
    manufacturer: "",
    sellingPrice: "",
    costPrice: "",
    normalPrice: "",
    quantity: "",
    minQuantity: "",
    location: "",
    supplierInfo: "",
    notes: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  useEffect(() => {
    if (isEditMode) {
      const loadProduct = async () => {
        try {
          setLoading(true);
          console.log("Fetching product with ID:", id);
          const data = await getProductById(id);
          console.log("Fetching product with ID:", data.id);
          
          if (!data) {
            throw new Error("Product not found");
          }
        
          setFormData({
            name: data.name || "",
            description: data.description || "",
            sku: data.sku || "",
            partNumber: data.partNumber || "_ _",
            category: data.productCategory || "",
            manufacturer: data.manufacturer || "_ _",
            sellingPrice: data.sellingPrice ? data.sellingPrice.toString() : "",
            costPrice: data.costPrice ? data.costPrice.toString() : "",
            normalPrice: data.normalPrice ? data.normalPrice.toString() : "",
            quantity: data.quantity ? data.quantity.toString() : "",
            minQuantity: data.minQuantity ? data.minQuantity.toString() : "",
            location: data.location || "",
            supplierInfo: data.supplierInfo || "",
            notes: data.notes || "",
          });
        } catch (err) {
          setError(
            err.message === "Product not found"
              ? "Product not found. Please check the ID."
              : "Failed to load product data. Please try again.",
          );
          console.error("Error loading product:", err);
        } finally {
          setLoading(false);
        }
      };
      loadProduct();
    }
  }, [id, isEditMode]);

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Product name is required";
    if (!formData.sku.trim()) errors.sku = "SKU is required";
    if (formData.sellingPrice && isNaN(parseFloat(formData.sellingPrice)))
      errors.sellingPrice = "Selling price must be a valid number";
    if (formData.costPrice && isNaN(parseFloat(formData.costPrice)))
      errors.costPrice = "Cost price must be a valid number";
    if (formData.normalPrice && isNaN(parseFloat(formData.normalPrice)))
      errors.normalPrice = "Normal price must be a valid number";
    if (formData.quantity && isNaN(parseInt(formData.quantity)))
      errors.quantity = "Quantity must be a valid number";
    if (formData.minQuantity && isNaN(parseInt(formData.minQuantity)))
      errors.minQuantity = "Minimum quantity must be a valid number";
    if (parseFloat(formData.sellingPrice) < 0)
      errors.sellingPrice = "Selling price cannot be negative";
    if (parseFloat(formData.costPrice) < 0)
      errors.costPrice = "Cost price cannot be negative";
    if (parseFloat(formData.normalPrice) < 0)
      errors.normalPrice = "Normal price cannot be negative";
    if (parseInt(formData.quantity) < 0)
      errors.quantity = "Quantity cannot be negative";
    if (parseInt(formData.minQuantity) < 0)
      errors.minQuantity = "Minimum quantity cannot be negative";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSearch = useCallback(
    debounce(async (value) => {
      if (!value.trim() || isEditMode) {
        setSearchMessage("");
        setIsSearching(false);
        return;
      }

      try {
        setIsSearching(true);
        setSearchMessage("Searching...");
        console.log("Searching for partNumber:", value);
        const product = await searchProductByPartNumber(value);
        if (product) {
          console.log("Product found:", product);
          setSearchMessage("Product found! Fields populated.");
          setFormData({
            id: product.id,
            name: product.name || "",
            description: product.description || "",
            sku: product.sku || value,
            partNumber: product.partNumber || value,
            category: product.category || "",
            manufacturer: product.manufacturer || "",
            sellingPrice: product.sellingPrice
              ? product.sellingPrice.toString()
              : "",
              costPrice: product.costPrice ? product.costPrice.toString() : "",
              normalPrice: product.normalPrice
              ? product.normalPrice.toString()
              : "",
            quantity: product.quantity ? product.quantity.toString() : "",
            minQuantity: product.minQuantity
              ? product.minQuantity.toString()
              : "",
            location: product.location || "",
            supplierInfo: product.supplierInfo || "",
            notes: product.notes || "",
          });
        } else {
          console.log("No product found for:", value);
          setSearchMessage("No product found. Enter new product details.");
        }
      } catch (err) {
        console.error("Search error:", err);
        setSearchMessage("Error searching product. Please try again.");
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [isEditMode],
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
    setSearchMessage("");

    if (name === "sku" || name === "partNumber") {
      handleSearch(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      const productData = {
        name: formData.name,
        description: formData.description,
        sku: formData.sku,
        partNumber: formData.partNumber,
        category: formData.category,
        manufacturer: formData.manufacturer,
        sellingPrice: parseFloat(formData.sellingPrice) || 0,
        costPrice: formData.costPrice ? parseFloat(formData.costPrice) : null,
        normalPrice: formData.normalPrice
          ? parseFloat(formData.normalPrice)
          : null,
        quantity: parseInt(formData.quantity) || 0,
        minQuantity: parseInt(formData.minQuantity) || 0,
        location: formData.location,
        supplierInfo: formData.supplierInfo,
        notes: formData.notes,
      };

      if (isEditMode) {
        console.log("Updating product with ID:", id, productData);
        await updateProduct(id, productData);
      } else {
        console.log("Creating product:", productData);
        await createProduct(productData);
      }
      navigate("/products");
    } catch (err) {
      setError(
        `Failed to ${isEditMode ? "update" : "create"} product: ${err.message || "Please try again."}`,
      );
      console.error("Error submitting product:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">
          {isEditMode ? "Edit Product" : "Add New Product"}
        </h1>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-500"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {searchMessage && (
        <div className="mb-4 p-4 bg-blue-50 border-l-4 border-blue-500">
          <p className="text-sm text-blue-700">{searchMessage}</p>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="md:col-span-2">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label
                    htmlFor="name"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Product Name
                  </label>
                  <input
                    type="hidden"
                    name="id"
                    id="id"
                    required
                    value={formData.id}
                    onChange={handleChange}
                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${formErrors.id ? "border-red-500" : ""}`}
                  />
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${formErrors.name ? "border-red-500" : ""}`}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.name}
                    </p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label
                    htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Description
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    rows="3"
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  ></textarea>
                </div>

                <div>
                  <label
                    htmlFor="sku"
                    className="block text-sm font-medium text-gray-700"
                  >
                    SKU
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="sku"
                      id="sku"
                      required
                      value={formData.sku}
                      onChange={handleChange}
                      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${formErrors.sku ? "border-red-500" : ""}`}
                    />
                    {isSearching && formData.sku && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <svg
                          className="animate-spin h-4 w-4 text-indigo-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  {formErrors.sku && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.sku}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="partNumber"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Part Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="partNumber"
                      id="partNumber"
                      value={formData.partNumber}
                      onChange={handleChange}
                      className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${formErrors.partNumber ? "border-red-500" : ""}`}
                    />
                    {console.log("just testing if data can reach this state :::::::::::::::::::", formData.partNumber)}
                    {isSearching && formData.partNumber && (
                      <div className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <svg
                          className="animate-spin h-4 w-4 text-indigo-500"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </div>
                    )}
                  </div>
                  {formErrors.partNumber && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.partNumber}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Category
                  </label>
                  <select
                    name="category"
                    id="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Hardwares">Hardware</option>
                    <option value="Software">Software</option>
                    <option value="Furnitures">Furniture</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Networking">Networking</option>
                    <option value="Accesories">Accessories</option>
                    <option value="DeskTops">Desktop</option>
                    <option value="Computer Screens">Computer Screen</option>
                    <option value="TV">TV</option>
                    <option value="Monitors">Monitor</option>
                    <option value="Tools">Tools</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="manufacturer"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Manufacturer
                  </label>
                  <input
                    type="text"
                    name="manufacturer"
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="md:col-span-2 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Pricing
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label
                    htmlFor="sellingPrice"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Selling Price
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="sellingPrice"
                      id="sellingPrice"
                      step="0.01"
                      min="0"
                      required
                      value={formData.sellingPrice}
                      onChange={handleChange}
                      className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md ${formErrors.sellingPrice ? "border-red-500" : ""}`}
                      placeholder="0.00"
                    />
                  </div>
                  {formErrors.sellingPrice && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.sellingPrice}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="costPrice"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Cost Price
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="costPrice"
                      id="costPrice"
                      step="0.01"
                      min="0"
                      value={formData.costPrice}
                      onChange={handleChange}
                      className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md ${formErrors.costPrice ? "border-red-500" : ""}`}
                      placeholder="0.00"
                    />
                  </div>
                  {formErrors.costPrice && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.costPrice}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="normalPrice"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Normal Price (for income calculations)
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="normalPrice"
                      id="normalPrice"
                      step="0.01"
                      min="0"
                      value={formData.normalPrice}
                      onChange={handleChange}
                      className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md ${formErrors.normalPrice ? "border-red-500" : ""}`}
                      placeholder="0.00"
                    />
                  </div>
                  {formErrors.normalPrice && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.normalPrice}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Inventory */}
            <div className="md:col-span-2 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Inventory
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label
                    htmlFor="quantity"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Current Quantity
                  </label>
                  <input
                    type="number"
                    name="quantity"
                    id="quantity"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={handleChange}
                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${formErrors.quantity ? "border-red-500" : ""}`}
                  />
                  {formErrors.quantity && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.quantity}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="minQuantity"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Minimum Quantity
                  </label>
                  <input
                    type="text"
                    name="minQuantity"
                    id="minQuantity"
                    min="0"
                    value={formData.minQuantity}
                    onChange={handleChange}
                    className={`mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md ${formErrors.minQuantity ? "border-red-500" : ""}`}
                  />
                  {formErrors.minQuantity && (
                    <p className="mt-1 text-sm text-red-600">
                      {formErrors.minQuantity}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="location"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Storage Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    id="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="md:col-span-2 border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Additional Information
              </h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label
                    htmlFor="supplierInfo"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Supplier Information
                  </label>
                  <input
                    type="text"
                    name="supplierInfo"
                    id="supplierInfo"
                    value={formData.supplierInfo}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>

                <div>
                  <label
                    htmlFor="notes"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Notes
                  </label>
                  <textarea
                    name="notes"
                    id="notes"
                    rows="3"
                    value={formData.notes}
                    onChange={handleChange}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  ></textarea>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/products")}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || isSearching}
              className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading || isSearching ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {isEditMode ? "Updating..." : "Creating..."}
                </span>
              ) : isEditMode ? (
                "Update Product"
              ) : (
                "Create Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;