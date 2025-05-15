import db from '../db.js';

export const createProperty = async (req, res) => {
    const {
        title, location, totalArea, dimensions, developmentType, developerRatio,
        goodwill, advance, facing, image, mapLink, permissions, reraStatus,
        landConversion, clearTitle, dealStatus = 'open'
    } = req.body;

  try {
    await db.query(
        `INSERT INTO properties 
        (title, location, total_area, dimensions, development_type, developer_ratio, goodwill, advance, facing, image, map_link, 
        permissions_type, permissions_status, rera_approved, land_conversion_complete, clear_title_verified, deal_status) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          title,
          location,
          totalArea,            // from req.body.totalArea → maps to `total_area`
          dimensions,
          developmentType,      // maps to `development_type`
          developerRatio,       // → `developer_ratio`
          goodwill,
          advance,
          facing,
          image,
          mapLink,
          permissions?.type,
          permissions?.status,
          reraStatus?.isApproved,
          landConversion?.isComplete,
          clearTitle?.isVerified,
          dealStatus || 'open'
        ]
      );
      

    res.status(201).json({ message: 'Property added successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
};

export const getAllProperties = async (req, res) => {
    try {
      const [rows] = await db.query('SELECT * FROM properties');
  
      const formatted = rows.map(row => ({
        id: row.id,
        title: row.title,
        location: row.location,
        totalArea: row.total_rea,
        dimensions: row.dimensions,
        developmentType: row.development_type,
        developerRatio: row.developer_ratio,
        goodwill: row.goodwill,
        advance: row.advance,
        facing: row.facing,
        image: row.image,
        mapLink: row.map_link,
        permissions: {
          type: row.permission_type,
          status: row.permission_status
        },
        reraStatus: {
          isApproved: !!row.rera_approved
        },
        landConversion: {
          isComplete: !!row.land_conversion_complete
        },
        clearTitle: {
          isVerified: !!row.clear_title_verified
        },
        dealStatus: row.deal_status || 'open'
      }));
  
      res.json(formatted);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  };
  
