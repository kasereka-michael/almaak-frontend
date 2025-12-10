export const columnMapping = {
    'productName': { field: 'productName', required: true },
    'productDescription': { field: 'productDescription', required: true },
    'productPartNumber': { field: 'productPartNumber', required: false },
    'productManufacturer': { field: 'productManufacturer', required: false },
    'productNormalPrice': {
      field: 'productNormalPrice',
      required: false,
      formatter: (value) => parseFloat(value),
    },
    'productSellingPrice': {
      field: 'productSellingPrice',
      required: true,
      formatter: (value) => parseFloat(value),
    },
  };