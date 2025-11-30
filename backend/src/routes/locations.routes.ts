/**
 * Egyptian Locations API Routes
 */

import { Router, Request, Response } from 'express';
import {
  getAllGovernorates,
  getCitiesByGovernorate,
  getDistrictsByCity,
  getGovernorateById,
  getCityById,
} from '../data/egypt-locations';

const router = Router();

/**
 * GET /api/v1/locations/governorates
 * Get all Egyptian governorates
 */
router.get('/governorates', (req: Request, res: Response) => {
  try {
    const governorates = getAllGovernorates();
    res.json({
      success: true,
      data: governorates,
    });
  } catch (error) {
    console.error('Error fetching governorates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch governorates',
    });
  }
});

/**
 * GET /api/v1/locations/governorates/:governorateId
 * Get a specific governorate with all its cities
 */
router.get('/governorates/:governorateId', (req: Request, res: Response) => {
  try {
    const { governorateId } = req.params;
    const governorate = getGovernorateById(governorateId);

    if (!governorate) {
      return res.status(404).json({
        success: false,
        error: 'Governorate not found',
      });
    }

    res.json({
      success: true,
      data: governorate,
    });
  } catch (error) {
    console.error('Error fetching governorate:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch governorate',
    });
  }
});

/**
 * GET /api/v1/locations/governorates/:governorateId/cities
 * Get all cities in a governorate
 */
router.get('/governorates/:governorateId/cities', (req: Request, res: Response) => {
  try {
    const { governorateId } = req.params;
    const cities = getCitiesByGovernorate(governorateId);

    if (cities.length === 0) {
      const governorate = getGovernorateById(governorateId);
      if (!governorate) {
        return res.status(404).json({
          success: false,
          error: 'Governorate not found',
        });
      }
    }

    res.json({
      success: true,
      data: cities,
    });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch cities',
    });
  }
});

/**
 * GET /api/v1/locations/governorates/:governorateId/cities/:cityId
 * Get a specific city with all its districts
 */
router.get('/governorates/:governorateId/cities/:cityId', (req: Request, res: Response) => {
  try {
    const { governorateId, cityId } = req.params;
    const city = getCityById(governorateId, cityId);

    if (!city) {
      return res.status(404).json({
        success: false,
        error: 'City not found',
      });
    }

    res.json({
      success: true,
      data: city,
    });
  } catch (error) {
    console.error('Error fetching city:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch city',
    });
  }
});

/**
 * GET /api/v1/locations/governorates/:governorateId/cities/:cityId/districts
 * Get all districts in a city
 */
router.get('/governorates/:governorateId/cities/:cityId/districts', (req: Request, res: Response) => {
  try {
    const { governorateId, cityId } = req.params;
    const districts = getDistrictsByCity(governorateId, cityId);

    if (districts.length === 0) {
      const city = getCityById(governorateId, cityId);
      if (!city) {
        return res.status(404).json({
          success: false,
          error: 'City not found',
        });
      }
    }

    res.json({
      success: true,
      data: districts,
    });
  } catch (error) {
    console.error('Error fetching districts:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch districts',
    });
  }
});

export default router;
