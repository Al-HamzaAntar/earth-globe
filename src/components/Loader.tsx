import React from 'react';

const Loader = () => {
  return (
    <div className="loader-wrapper">
      <div className="sphere">
        {/* Meridians */}
        {Array.from({ length: 36 }, (_, i) => (
          <div key={`meridian-${i}`} className="meridian" />
        ))}
        {/* Latitudes */}
        {Array.from({ length: 12 }, (_, i) => (
          <div key={`latitude-${i}`} className="latitude" />
        ))}
        {/* Axis */}
        <div className="axis" />
        <div className="axis" />
      </div>
    </div>
  );
};

export default Loader;
