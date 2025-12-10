import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fetchProducts, deleteProduct } from '../../services/api';
import { exportToPdf } from '../../utils/exportUtils';
import DataExport from '../common/DataExport';
import ProductImport from './ProductImport';
import { TrashService } from '../../services/trashService';


const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [pagination, setPagination] = useState({
        currentPage: 0,
        totalPages: 0,
        totalItems: 0,
        isFirst: true,
        isLast: false,
        hasNext: false,
        hasPrevious: false,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showImport, setShowImport] = useState(false);
    const [pageNo, setPageNo] = useState(0);
    const [pageSize] = useState(10);
    const [sortBy] = useState('productId');
    const [sortDir] = useState('asc');
    const [exportingAll, setExportingAll] = useState(false);

    useEffect(() => {
        loadProducts();
    }, [pageNo, searchTerm, filterCategory, filterStatus]);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const params = {
                pageNo,
                pageSize,
                sortBy,
                sortDir,
                search: searchTerm || undefined,
                category: filterCategory !== 'all' ? filterCategory : undefined,
                status: filterStatus !== 'all' ? filterStatus : undefined,
            };
            const data = await fetchProducts(params);
            setProducts(data.products);
            setPagination({
                currentPage: data.currentPage,
                totalPages: data.totalPages,
                totalItems: data.totalItems,
                isFirst: data.isFirst,
                isLast: data.isLast,
                hasNext: data.hasNext,
                hasPrevious: data.hasPrevious,
            });
            setError('');
        } catch (err) {
            setError('Failed to load products. Please try again.');
            console.error('Error loading products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        const product = products.find(p => (p.id ?? p.productId) === id);
        const label = product ? (product.sku || product.partNumber || product.name || product.productName || `Product ${id}`) : `Product ${id}`;
        if (!window.confirm(`Are you sure you want to delete ${label}? It will be moved to trash and can be restored later.`)) return;
        try {
            setLoading(true);
            await deleteProduct(id);
            setProducts(prev => prev.filter(p => (p.id ?? p.productId) !== id));
            setError('');
            TrashService.showNotification('Product moved to trash successfully. You can restore it from the trash if needed.', 'success');
        } catch (err) {
            console.error('Product delete failed:', err);
            const msg = err?.response?.data?.message || 'Failed to delete product. Please try again.';
            setError(msg);
            TrashService.showNotification(msg, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 0 && newPage < pagination.totalPages) {
            setPageNo(newPage);
        }
    };

    const handleExportAllPdf = async () => {
        try {
            setExportingAll(true);
            let pageNoAll = 0;
            const pageSizeAll = 200;
            let allProducts = [];
            while (true) {
                const pageData = await fetchProducts({ pageNo: pageNoAll, pageSize: pageSizeAll, sortBy, sortDir });
                const pageProducts = Array.isArray(pageData?.products) ? pageData.products : [];
                allProducts = allProducts.concat(pageProducts);
                if (!pageData?.hasNext) break;
                pageNoAll += 1;
            }
            const rows = allProducts.map(p => {
                const sp = p.sellingPrice;
                let priceStr = '';
                if (sp !== undefined && sp !== null && sp !== '') {
                    const val = typeof sp === 'number' ? sp : parseFloat(sp);
                    if (!isNaN(val)) priceStr = `$${val.toFixed(2)}`;
                }
                return {
                    name: p.name || '',
                    description: p.description || '',
                    partDisplay: p.partNumber || p.sku || '',
                    manufacturer: p.manufacturer || '',
                    price: priceStr
                };
            });
            await exportToPdf(
                rows,
                `products-all-${new Date().toISOString().split('T')[0]}`,
                [
                    { label: 'Product Name', key: 'name' },
                    { label: 'Product Description', key: 'description' },
                    { label: 'Part Number', key: 'partDisplay' },
                    { label: 'Manufacturer', key: 'manufacturer' },
                    { label: 'Price', key: 'price' },
                ],
                'ALMAAKCORP Products from Database'
            );
        } catch (err) {
            console.error('Error exporting all products:', err);
            setError('Failed to export products to PDF. Please try again.');
        } finally {
            setExportingAll(false);
        }
    };

    // Get unique categories for filter
    const categories = [...new Set(products.map(product => product.category))].filter(Boolean);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
                <div className="flex space-x-3">
                    <button
                        onClick={() => setShowImport(!showImport)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                        {showImport ? 'Hide Import' : 'Batch Import'}
                    </button>
                    <button
                        onClick={handleExportAllPdf}
                        disabled={exportingAll}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                        {exportingAll ? 'Exporting...' : 'Export All to PDF'}
                    </button>
                    <Link
                        to="/products/new"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        Add New Product
                    </Link>
                </div>
            </div>

            {showImport && (
                <div className="mb-6">
                    <ProductImport
                        onComplete={() => {
                            setShowImport(false);
                            loadProducts();
                        }}
                    />
                </div>
            )}

            {error && (
                <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                            <div className="relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div>
                                <label htmlFor="categoryFilter" className="mr-2 text-sm font-medium text-gray-700">Category:</label>
                                <select
                                    id="categoryFilter"
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                >
                                    <option value="all">All Categories</option>
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="statusFilter" className="mr-2 text-sm font-medium text-gray-700">Status:</label>
                                <select
                                    id="statusFilter"
                                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                >
                                    <option value="all">All</option>
                                    <option value="in-stock">In Stock</option>
                                    <option value="low-stock">Low Stock</option>
                                    <option value="out-of-stock">Out of Stock</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : (
                    <>
                        <div className="p-4 flex justify-between items-center bg-gray-50 border-t border-gray-200">
                            <div className="text-sm text-gray-500">
                                {pagination.totalItems} {pagination.totalItems === 1 ? 'product' : 'products'} found
                                {filterCategory !== 'all' ? ` in "${filterCategory}"` : ''}
                                {filterStatus !== 'all' ? ` (${filterStatus})` : ''}
                                {searchTerm ? ` matching "${searchTerm}"` : ''}
                            </div>
                            <DataExport
                                data={products}
                                fileName={`products-export-${new Date().toISOString().split('T')[0]}`}
                                title="ALMAAKCORP Products Report"
                                columns={[
                                    { header: 'Name', key: 'name' },
                                    { header: 'Description', key: 'productDescription' },
                                    { header: 'SKU', key: 'sku' },
                                    { header: 'Category', key: 'category' },
                                    { header: 'Manufacturer', key: 'manufacturer' },
                                    { header: 'Selling Price', key: 'sellingPrice' },
                                    { header: 'Cost Price', key: 'costPrice' },
                                    { header: 'Quantity', key: 'quantity' },
                                    { header: 'Min Quantity', key: 'minQuantity' },
                                    { header: 'Part Number', key: 'partNumber' },
                                    { header: 'Description', key: 'description' },
                                ]}
                                excelButtonText="Export to Excel"
                                pdfButtonText="Export to PDF"
                            />
                        </div>
                        <div className="p-4 flex justify-between items-center bg-gray-50 border-t border-gray-200">
                            <button
                                disabled={pagination.isFirst}
                                onClick={() => handlePageChange(pageNo - 1)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <span>Page {pagination.currentPage + 1} of {pagination.totalPages}</span>
                            <button
                                disabled={pagination.isLast}
                                onClick={() => handlePageChange(pageNo + 1)}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Product Description
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            SKU / Part No.
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Category
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Price
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Stock
                                        </th>
                                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">

                                        {/*{                             console.log(*/}
                                        {/*"Products array:",*/}
                                        {/*products.map((product) => ({*/}
                                        {/*    id: product.id,*/}
                                        {/*    name: product.name || 'Unnamed Product',*/}
                                        {/*    sku: product.sku || '',*/}
                                        {/*}))*/}
                                        {/*)}*/}

                                    
                                    {products.map((product) => (
                                        <tr key={product.id}>
                                            <td className="px-6 py-4 w-64 whitespace-normal break-words">
                                                <div className="flex items-center">
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {product.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {product.manufacturer}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 w-70 whitespace-normal break-words">
                                                <div className="flex items-center">
                                                    <div className="ml-4">
                                                        {/*<div className="text-sm font-medium text-gray-900">*/}
                                                        {/*    {product.name}*/}
                                                        {/*</div>*/}
                                                        <div className="text-sm text-gray-500">
                                                            {product.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{product.sku}</div>
                                                {product.partNumber && (
                                                    <div className="text-xs text-gray-500">Part: {product.partNumber}</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {product.category}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    {product.sellingPrice ? `$${product.sellingPrice.toFixed(2)}` : 'N/A'}
                                                </div>
                                                {product.normalPrice && (
                                                    <div className="text-xs text-gray-500">
                                                        Cost: ${typeof product.normalPrice === 'number' ? product.normalPrice.toFixed(2) : '0.00'}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium 
                                                        ${!product.quantity || product.quantity === 0 ? 'bg-red-100 text-red-800' : 
                                                          (product.quantity && product.quantity <= product.minQuantity) ? 'bg-yellow-100 text-yellow-800' : 
                                                          'bg-green-100 text-green-800'}`}>
                                                        {product.quantity || 0} in stock
                                                    </span>
                                                </div>
                                                {product.minQuantity && product.quantity && product.quantity <= product.minQuantity && product.quantity > 0 && (
                                                    <div className="text-xs text-yellow-600 mt-1">Low stock</div>
                                                )}
                                                {(!product.quantity || product.uantity === 0) && (
                                                    <div className="text-xs text-red-600 mt-1">Out of stock</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <Link to={`/products/edit/${product.id}`} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id ?? product.productId)}
                                                    className="text-red-600 hover:text-red-900 disabled:opacity-50"
                                                    title="Move to trash"
                                                    disabled={loading}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {products.length === 0 && (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                                                No products found matching your search criteria
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProductList;