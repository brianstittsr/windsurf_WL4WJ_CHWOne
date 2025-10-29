'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography, FormGroup, FormControlLabel, Checkbox, Paper, useTheme } from '@mui/material';

// Define the regions and their counties
const regionsData = {
  region3: {
    name: 'Region 3',
    color: '#FF9800', // Orange
    counties: [
      'Alexander', 'Anson', 'Cabarrus', 'Catawba', 'Cleveland', 
      'Gaston', 'Iredell', 'Lincoln', 'Mecklenburg', 'Rowan', 
      'Stanly', 'Union'
    ]
  },
  region4: {
    name: 'Region 4',
    color: '#9C27B0', // Purple
    counties: [
      'Alamance', 'Caswell', 'Chatham', 'Durham', 'Franklin', 
      'Granville', 'Johnston', 'Nash', 'Orange', 'Person', 
      'Vance', 'Wake', 'Warren', 'Wilson'
    ]
  },
  region5: {
    name: 'Region 5',
    color: '#E91E63', // Pink
    counties: [
      'Bladen', 'Brunswick', 'Columbus', 'Cumberland', 'Harnett', 
      'Hoke', 'Lee', 'Montgomery', 'Moore', 'New Hanover', 'Pender', 
      'Richmond', 'Robeson', 'Sampson', 'Scotland'
    ]
  }
};

interface NCCHWARegionsMapProps {
  height?: string | number;
  width?: string | number;
  defaultRegions?: string[];
}

const NCCHWARegionsMap: React.FC<NCCHWARegionsMapProps> = ({ 
  height = 500, 
  width = '100%',
  defaultRegions = ['region3', 'region4', 'region5']
}) => {
  const theme = useTheme();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const [selectedRegions, setSelectedRegions] = useState<string[]>(defaultRegions);
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Handle region toggle
  const handleRegionToggle = (region: string) => {
    setSelectedRegions(prev => 
      prev.includes(region) 
        ? prev.filter(r => r !== region) 
        : [...prev, region]
    );
  };

  // Get region for a county
  const getRegionForCounty = (county: string): string | null => {
    for (const [regionId, region] of Object.entries(regionsData)) {
      if (region.counties.includes(county)) {
        return regionId;
      }
    }
    return null;
  };

  // Initialize the map
  useEffect(() => {
    // Only run this in the browser
    if (typeof window === 'undefined') return;

    // Load D3 and TopoJSON 
    const loadScripts = async () => {
      try {
        // Check if d3 is already loaded
        if (!(window as any).d3) {
          const d3Script = document.createElement('script');
          d3Script.src = 'https://d3js.org/d3.v7.min.js';
          d3Script.async = true;
          document.body.appendChild(d3Script);
          await Promise.race([
            new Promise(resolve => d3Script.onload = resolve),
            new Promise((_, reject) => setTimeout(() => reject(new Error('D3 load timeout')), 5000))
          ]);
        }

        // Check if topojson is already loaded
        if (!(window as any).topojson) {
          const topoScript = document.createElement('script');
          topoScript.src = 'https://unpkg.com/topojson@3.0.2/dist/topojson.min.js';
          topoScript.async = true;
          document.body.appendChild(topoScript);
          await Promise.race([
            new Promise(resolve => topoScript.onload = resolve),
            new Promise((_, reject) => setTimeout(() => reject(new Error('TopoJSON load timeout')), 5000))
          ]);
        }

        // Now that scripts are loaded, initialize the map
        await initializeMap();
      } catch (error) {
        console.error('Error loading map scripts:', error);
        // Don't block the page if map fails to load
      }
    };

    loadScripts();

    return () => {
      // Clean up SVG when component unmounts
      if (mapContainerRef.current) {
        const svg = mapContainerRef.current.querySelector('svg');
        if (svg) svg.remove();
      }
    };
  }, []);

  // Update map when selected regions change
  useEffect(() => {
    if (mapLoaded) {
      updateMap();
    }
  }, [selectedRegions, mapLoaded]);

  // Initialize the map
  const initializeMap = async () => {
    const d3 = (window as any).d3;
    const topojson = (window as any).topojson;
    
    if (!d3 || !topojson || !mapContainerRef.current) return;

    // Clear any existing SVG
    d3.select(mapContainerRef.current).select('svg').remove();

    // Set up dimensions
    const width = mapContainerRef.current.clientWidth;
    const height = mapContainerRef.current.clientHeight || width * 0.6 || 500;

    // Create SVG
    const svg = d3.select(mapContainerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', [0, 0, width, height])
      .attr('style', 'max-width: 100%; height: auto;');

    // Create a group for the map
    const g = svg.append('g');

    try {
      // Load NC counties TopoJSON
      const ncData = await d3.json('/data/nc-counties-topojson.json');
      
      // If data failed to load, show error message
      if (!ncData) {
        console.error('Failed to load NC counties data');
        return;
      }

      // Extract counties features
      const counties = topojson.feature(ncData, ncData.objects.counties);

      // Set up projection
      const projection = d3.geoMercator()
        .fitSize([width, height], counties);

      // Create path generator
      const path = d3.geoPath().projection(projection);

      // Draw counties
      g.selectAll('path')
        .data(counties.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('class', 'county')
        .attr('id', (d: any) => `county-${d.properties.name.replace(/\s+/g, '-').toLowerCase()}`)
        .attr('stroke', theme.palette.grey[300])
        .attr('stroke-width', 0.5)
        .attr('fill', (d: any) => {
          const county = d.properties.name;
          const region = getRegionForCounty(county);
          if (region && selectedRegions.includes(region)) {
            return regionsData[region as keyof typeof regionsData].color;
          }
          return theme.palette.grey[100];
        })
        .on('mouseover', (event: any, d: any) => {
          const county = d.properties.name;
          setHoveredCounty(county);
          d3.select(event.currentTarget)
            .attr('stroke', theme.palette.common.black)
            .attr('stroke-width', 1.5);
        })
        .on('mouseout', (event: any) => {
          setHoveredCounty(null);
          d3.select(event.currentTarget)
            .attr('stroke', theme.palette.grey[300])
            .attr('stroke-width', 0.5);
        });

      // Add county labels
      g.selectAll('text')
        .data(counties.features)
        .enter()
        .append('text')
        .attr('transform', (d: any) => `translate(${path.centroid(d)})`)
        .attr('text-anchor', 'middle')
        .attr('font-size', '8px')
        .attr('fill', (d: any) => {
          const county = d.properties.name;
          const region = getRegionForCounty(county);
          if (region && selectedRegions.includes(region)) {
            // Use white text on colored backgrounds for better contrast
            return '#ffffff';
          }
          return theme.palette.text.primary;
        })
        .text((d: any) => d.properties.name);

      setMapLoaded(true);
    } catch (error) {
      console.error('Error loading or rendering map:', error);
    }
  };

  // Update the map when selected regions change
  const updateMap = () => {
    const d3 = (window as any).d3;
    if (!d3 || !mapContainerRef.current) return;

    d3.select(mapContainerRef.current)
      .selectAll('.county')
      .attr('fill', (d: any) => {
        const county = d.properties.name;
        const region = getRegionForCounty(county);
        if (region && selectedRegions.includes(region)) {
          return regionsData[region as keyof typeof regionsData].color;
        }
        return theme.palette.grey[100];
      });

    // Update text colors
    d3.select(mapContainerRef.current)
      .selectAll('text')
      .attr('fill', (d: any) => {
        const county = d.properties.name;
        const region = getRegionForCounty(county);
        if (region && selectedRegions.includes(region)) {
          return '#ffffff';
        }
        return theme.palette.text.primary;
      });
  };

  return (
    <Paper elevation={2} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        NCCHWA Regions Map
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
        {/* Map Container */}
        <Box 
          ref={mapContainerRef} 
          sx={{ 
            flex: 1,
            height: height, 
            width: width,
            position: 'relative',
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 1,
            overflow: 'hidden'
          }}
        >
          {!mapLoaded && (
            <Box sx={{ 
              position: 'absolute', 
              top: 0, 
              left: 0, 
              right: 0, 
              bottom: 0, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              bgcolor: 'rgba(255,255,255,0.8)'
            }}>
              <Typography>Loading map...</Typography>
            </Box>
          )}
        </Box>
        
        {/* Controls */}
        <Box sx={{ minWidth: 200 }}>
          <Typography variant="subtitle1" gutterBottom>
            Toggle Regions
          </Typography>
          
          <FormGroup>
            {Object.entries(regionsData).map(([regionId, region]) => (
              <FormControlLabel
                key={regionId}
                control={
                  <Checkbox
                    checked={selectedRegions.includes(regionId)}
                    onChange={() => handleRegionToggle(regionId)}
                    sx={{
                      color: region.color,
                      '&.Mui-checked': {
                        color: region.color,
                      },
                    }}
                  />
                }
                label={region.name}
              />
            ))}
          </FormGroup>
          
          {hoveredCounty && (
            <Box sx={{ mt: 2, p: 1, bgcolor: 'background.default', borderRadius: 1 }}>
              <Typography variant="body2">
                <strong>County:</strong> {hoveredCounty}
              </Typography>
              {getRegionForCounty(hoveredCounty) && (
                <Typography variant="body2">
                  <strong>Region:</strong> {regionsData[getRegionForCounty(hoveredCounty) as keyof typeof regionsData].name}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default NCCHWARegionsMap;
