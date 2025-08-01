import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { materialCreationFormRequestSchema, MaterialCreationFormRequest } from '../../schemas/materialSchema';
import { PlusIcon, UploadIcon, SaveIcon, CancelIcon } from '../../assets/icons/index.tsx';

const AddMaterial: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm<MaterialCreationFormRequest>({
    resolver: zodResolver(materialCreationFormRequestSchema),
    defaultValues: {
      name: '',
      description: '',
      materialTypeId: 0,
      recycledPercentage: 0,
      quantityAvailable: 0,
      pricePerUnit: 0,
      documentationUrl: '',
      carbonFootprint: 0,
      carbonFootprintUnit: '',
      waterUsage: 0,
      waterUsageUnit: '',
      wasteDiverted: 0,
      wasteDivertedUnit: '',
      productionCountry: '',
      productionRegion: '',
      manufacturingProcess: '',
      certificationDetails: '',
      certificationExpiryDate: '',
      organicCertificationType: '',
      qualityStandards: '',
      transportDistance: 0,
      transportMethod: '',
      sustainabilityCriteria: [],
    },
  });

  // Mock data cho material types
  const materialTypes = [
    { typeId: 1, typeName: 'Organic Cotton', category: 'Natural Fibers' },
    { typeId: 2, typeName: 'Recycled Polyester', category: 'Synthetic Fibers' },
    { typeId: 3, typeName: 'Hemp', category: 'Natural Fibers' },
    { typeId: 4, typeName: 'Bamboo', category: 'Natural Fibers' },
    { typeId: 5, typeName: 'Recycled Nylon', category: 'Synthetic Fibers' },
  ];

  // Mock data cho sustainability criteria
  const sustainabilityCriteria = [
    { criterionId: 1, name: 'Carbon Footprint', unit: 'kg CO2e/kg' },
    { criterionId: 2, name: 'Water Usage', unit: 'L/kg' },
    { criterionId: 3, name: 'Waste Diverted', unit: 'kg' },
  ];

  const onSubmit = async (data: MaterialCreationFormRequest) => {
    setIsSubmitting(true);
    try {
      console.log('Form data:', data);
      // TODO: Implement API call to create material
      // const response = await createMaterial(data);
      
      // Reset form after successful submission
      reset();
      setUploadedFiles([]);
      alert('Material created successfully!');
    } catch (error) {
      console.error('Error creating material:', error);
      alert('Error creating material. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="dashboard-main">
      <div className="dashboard-container">
        <div className="dashboard-content">
          {/* Header */}
          <div className="dashboard-header">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="dashboard-title">Add New Material</h1>
                <p className="dashboard-subtitle">Create a new material listing for your inventory</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => window.history.back()}
                  className="btn-secondary"
                >
                  <CancelIcon className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSubmit(onSubmit)}
                  disabled={isSubmitting}
                  className="btn-primary"
                >
                  <SaveIcon className="w-4 h-4" />
                  {isSubmitting ? 'Saving...' : 'Save Material'}
                </button>
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Basic Information */}
            <div className="dashboard-card">
              <div className="card-header">
                <h3 className="card-title">Basic Information</h3>
                <p className="card-subtitle">Essential details about the material</p>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Material Name */}
                  <div className="form-group">
                    <label className="form-label">Material Name *</label>
                    <input
                      type="text"
                      {...register('name')}
                      className={`form-input ${errors.name ? 'form-input-error' : ''}`}
                      placeholder="Enter material name"
                    />
                    {errors.name && (
                      <p className="form-error">{errors.name.message}</p>
                    )}
                  </div>

                  {/* Material Type */}
                  <div className="form-group">
                    <label className="form-label">Material Type *</label>
                    <select
                      {...register('materialTypeId', { valueAsNumber: true })}
                      className={`form-select ${errors.materialTypeId ? 'form-select-error' : ''}`}
                    >
                      <option value="">Select material type</option>
                      {materialTypes.map((type) => (
                        <option key={type.typeId} value={type.typeId}>
                          {type.typeName} ({type.category})
                        </option>
                      ))}
                    </select>
                    {errors.materialTypeId && (
                      <p className="form-error">{errors.materialTypeId.message}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="form-group md:col-span-2">
                    <label className="form-label">Description</label>
                    <textarea
                      {...register('description')}
                      rows={4}
                      className={`form-textarea ${errors.description ? 'form-textarea-error' : ''}`}
                      placeholder="Describe the material, its properties, and benefits"
                    />
                    {errors.description && (
                      <p className="form-error">{errors.description.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing & Inventory */}
            <div className="dashboard-card">
              <div className="card-header">
                <h3 className="card-title">Pricing & Inventory</h3>
                <p className="card-subtitle">Pricing and stock information</p>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Quantity Available */}
                  <div className="form-group">
                    <label className="form-label">Quantity Available *</label>
                    <input
                      type="number"
                      {...register('quantityAvailable', { valueAsNumber: true })}
                      className={`form-input ${errors.quantityAvailable ? 'form-input-error' : ''}`}
                      placeholder="0"
                      min="0"
                    />
                    {errors.quantityAvailable && (
                      <p className="form-error">{errors.quantityAvailable.message}</p>
                    )}
                  </div>

                  {/* Price Per Unit */}
                  <div className="form-group">
                    <label className="form-label">Price Per Unit *</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        {...register('pricePerUnit', { valueAsNumber: true })}
                        className={`form-input pl-8 ${errors.pricePerUnit ? 'form-input-error' : ''}`}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                    </div>
                    {errors.pricePerUnit && (
                      <p className="form-error">{errors.pricePerUnit.message}</p>
                    )}
                  </div>

                  {/* Recycled Percentage */}
                  <div className="form-group">
                    <label className="form-label">Recycled Percentage *</label>
                    <div className="relative">
                      <input
                        type="number"
                        {...register('recycledPercentage', { valueAsNumber: true })}
                        className={`form-input pr-8 ${errors.recycledPercentage ? 'form-input-error' : ''}`}
                        placeholder="0"
                        min="0"
                        max="100"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500">%</span>
                    </div>
                    {errors.recycledPercentage && (
                      <p className="form-error">{errors.recycledPercentage.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sustainability Metrics */}
            <div className="dashboard-card">
              <div className="card-header">
                <h3 className="card-title">Sustainability Metrics</h3>
                <p className="card-subtitle">Environmental impact measurements</p>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Carbon Footprint */}
                  <div className="form-group">
                    <label className="form-label">Carbon Footprint</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        {...register('carbonFootprint', { valueAsNumber: true })}
                        className={`form-input ${errors.carbonFootprint ? 'form-input-error' : ''}`}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                      <select
                        {...register('carbonFootprintUnit')}
                        className="form-select"
                      >
                        <option value="">Unit</option>
                        <option value="kg CO2e/kg">kg CO2e/kg</option>
                        <option value="kg CO2e/m2">kg CO2e/m2</option>
                        <option value="kg CO2e/unit">kg CO2e/unit</option>
                      </select>
                    </div>
                    {errors.carbonFootprint && (
                      <p className="form-error">{errors.carbonFootprint.message}</p>
                    )}
                  </div>

                  {/* Water Usage */}
                  <div className="form-group">
                    <label className="form-label">Water Usage</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        {...register('waterUsage', { valueAsNumber: true })}
                        className={`form-input ${errors.waterUsage ? 'form-input-error' : ''}`}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                      <select
                        {...register('waterUsageUnit')}
                        className="form-select"
                      >
                        <option value="">Unit</option>
                        <option value="L/kg">L/kg</option>
                        <option value="L/m2">L/m2</option>
                        <option value="m3/kg">m3/kg</option>
                      </select>
                    </div>
                    {errors.waterUsage && (
                      <p className="form-error">{errors.waterUsage.message}</p>
                    )}
                  </div>

                  {/* Waste Diverted */}
                  <div className="form-group">
                    <label className="form-label">Waste Diverted</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        {...register('wasteDiverted', { valueAsNumber: true })}
                        className={`form-input ${errors.wasteDiverted ? 'form-input-error' : ''}`}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                      <select
                        {...register('wasteDivertedUnit')}
                        className="form-select"
                      >
                        <option value="">Unit</option>
                        <option value="kg">kg</option>
                        <option value="tons">tons</option>
                        <option value="%">%</option>
                      </select>
                    </div>
                    {errors.wasteDiverted && (
                      <p className="form-error">{errors.wasteDiverted.message}</p>
                    )}
                  </div>

                  {/* Transport Distance */}
                  <div className="form-group">
                    <label className="form-label">Transport Distance</label>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        {...register('transportDistance', { valueAsNumber: true })}
                        className={`form-input ${errors.transportDistance ? 'form-input-error' : ''}`}
                        placeholder="0"
                        min="0"
                      />
                      <select
                        {...register('transportMethod')}
                        className="form-select"
                      >
                        <option value="">Method</option>
                        <option value="Road">Road</option>
                        <option value="Rail">Rail</option>
                        <option value="Sea">Sea</option>
                        <option value="Air">Air</option>
                      </select>
                    </div>
                    {errors.transportDistance && (
                      <p className="form-error">{errors.transportDistance.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Production & Certification */}
            <div className="dashboard-card">
              <div className="card-header">
                <h3 className="card-title">Production & Certification</h3>
                <p className="card-subtitle">Manufacturing details and certifications</p>
              </div>
              <div className="card-body">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Production Country */}
                  <div className="form-group">
                    <label className="form-label">Production Country</label>
                    <input
                      type="text"
                      {...register('productionCountry')}
                      className={`form-input ${errors.productionCountry ? 'form-input-error' : ''}`}
                      placeholder="e.g., Vietnam, China, India"
                    />
                    {errors.productionCountry && (
                      <p className="form-error">{errors.productionCountry.message}</p>
                    )}
                  </div>

                  {/* Production Region */}
                  <div className="form-group">
                    <label className="form-label">Production Region</label>
                    <input
                      type="text"
                      {...register('productionRegion')}
                      className={`form-input ${errors.productionRegion ? 'form-input-error' : ''}`}
                      placeholder="e.g., Southern Vietnam, Guangdong"
                    />
                    {errors.productionRegion && (
                      <p className="form-error">{errors.productionRegion.message}</p>
                    )}
                  </div>

                  {/* Manufacturing Process */}
                  <div className="form-group">
                    <label className="form-label">Manufacturing Process</label>
                    <textarea
                      {...register('manufacturingProcess')}
                      rows={3}
                      className={`form-textarea ${errors.manufacturingProcess ? 'form-textarea-error' : ''}`}
                      placeholder="Describe the manufacturing process"
                    />
                    {errors.manufacturingProcess && (
                      <p className="form-error">{errors.manufacturingProcess.message}</p>
                    )}
                  </div>

                  {/* Certification Details */}
                  <div className="form-group">
                    <label className="form-label">Certification Details</label>
                    <textarea
                      {...register('certificationDetails')}
                      rows={3}
                      className={`form-textarea ${errors.certificationDetails ? 'form-textarea-error' : ''}`}
                      placeholder="List relevant certifications"
                    />
                    {errors.certificationDetails && (
                      <p className="form-error">{errors.certificationDetails.message}</p>
                    )}
                  </div>

                  {/* Certification Expiry Date */}
                  <div className="form-group">
                    <label className="form-label">Certification Expiry Date</label>
                    <input
                      type="date"
                      {...register('certificationExpiryDate')}
                      className={`form-input ${errors.certificationExpiryDate ? 'form-input-error' : ''}`}
                    />
                    {errors.certificationExpiryDate && (
                      <p className="form-error">{errors.certificationExpiryDate.message}</p>
                    )}
                  </div>

                  {/* Organic Certification Type */}
                  <div className="form-group">
                    <label className="form-label">Organic Certification Type</label>
                    <select
                      {...register('organicCertificationType')}
                      className="form-select"
                    >
                      <option value="">Select certification type</option>
                      <option value="GOTS">GOTS (Global Organic Textile Standard)</option>
                      <option value="OEKO-TEX">OEKO-TEX Standard 100</option>
                      <option value="USDA">USDA Organic</option>
                      <option value="EU Organic">EU Organic</option>
                      <option value="Other">Other</option>
                    </select>
                    {errors.organicCertificationType && (
                      <p className="form-error">{errors.organicCertificationType.message}</p>
                    )}
                  </div>

                  {/* Quality Standards */}
                  <div className="form-group">
                    <label className="form-label">Quality Standards</label>
                    <input
                      type="text"
                      {...register('qualityStandards')}
                      className={`form-input ${errors.qualityStandards ? 'form-input-error' : ''}`}
                      placeholder="e.g., ISO 9001, ISO 14001"
                    />
                    {errors.qualityStandards && (
                      <p className="form-error">{errors.qualityStandards.message}</p>
                    )}
                  </div>

                  {/* Documentation URL */}
                  <div className="form-group md:col-span-2">
                    <label className="form-label">Documentation URL</label>
                    <input
                      type="url"
                      {...register('documentationUrl')}
                      className={`form-input ${errors.documentationUrl ? 'form-input-error' : ''}`}
                      placeholder="https://example.com/documentation"
                    />
                    {errors.documentationUrl && (
                      <p className="form-error">{errors.documentationUrl.message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* File Upload */}
            <div className="dashboard-card">
              <div className="card-header">
                <h3 className="card-title">Material Images & Documents</h3>
                <p className="card-subtitle">Upload images and supporting documents</p>
              </div>
              <div className="card-body">
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-brand-500 transition-colors">
                  <UploadIcon className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">
                    Upload Files
                  </h4>
                  <p className="text-gray-600 mb-4">
                    Drag and drop your files here or click to browse
                  </p>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="btn-secondary cursor-pointer inline-flex items-center gap-2"
                  >
                    <PlusIcon className="w-4 h-4" />
                    Choose Files
                  </label>
                </div>

                {/* Uploaded Files List */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-6">
                    <h5 className="font-medium text-gray-800 mb-3">Uploaded Files:</h5>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-brand-100 rounded flex items-center justify-center">
                              <UploadIcon className="w-4 h-4 text-brand-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{file.name}</p>
                              <p className="text-sm text-gray-500">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <CancelIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="btn-secondary"
              >
                <CancelIcon className="w-4 h-4" />
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
              >
                <SaveIcon className="w-4 h-4" />
                {isSubmitting ? 'Saving...' : 'Save Material'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddMaterial; 