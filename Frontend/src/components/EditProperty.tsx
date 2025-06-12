import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const EditProperty: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState<any>(null);
  const [image, setImage] = useState<File | null>(null);

  useEffect(() => {
    fetch(`http://localhost:5174/api/properties/${id}`)
      .then((res) => res.json())
      .then((data) => setProperty(data.project))
      .catch((err) => console.error(err));
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProperty({ ...property, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const formData = new FormData();
    for (const key in property) {
      if (key !== 'imageUrl') {
        formData.append(key, property[key]);
      }
    }
    if (image) formData.append('image', image);

    const res = await fetch(`http://localhost:5174/api/properties/${id}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token || ''}`,
      },
      body: formData,
    });

    const result = await res.json();
    if (result.success) {
      alert('Property updated!');
      navigate('/profile');
    } else {
      alert('Failed to update.');
    }
  };

  if (!property) return <div className="p-6">Loading...</div>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-2xl font-bold mb-6">Edit Property</h1>
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded shadow">
        <input
          type="text"
          name="title"
          value={property.title}
          onChange={handleChange}
          placeholder="Title"
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="location"
          value={property.location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="totalArea"
          value={property.totalArea}
          onChange={handleChange}
          placeholder="Total Area"
          className="w-full border p-2 rounded"
        />
        <select
          name="developmentType"
          value={property.developmentType}
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >
          <option value="">Select Type</option>
          <option value="villa">Villa</option>
          <option value="highrise">Highrise</option>
          <option value="mixed">Mixed</option>
          <option value="plotted">Plotted</option>
          <option value="standalone">Standalone</option>
        </select>
        <input
          type="text"
          name="developerRatio"
          value={property.developerRatio}
          onChange={handleChange}
          placeholder="Developer Ratio"
          className="w-full border p-2 rounded"
        />
        <input
          type="text"
          name="advance"
          value={property.advance}
          onChange={handleChange}
          placeholder="Advance"
          className="w-full border p-2 rounded"
        />
        <label className="block">
          Upload New Image:
          <input
            type="file"
            onChange={(e) => e.target.files && setImage(e.target.files[0])}
            className="mt-1"
          />
        </label>

        <button
          type="submit"
          className="bg-teal-600 text-white px-6 py-2 rounded hover:bg-teal-700"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProperty;
