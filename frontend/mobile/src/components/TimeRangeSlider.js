import React, { useMemo, useState, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";

const TimeRangeSlider = ({ 
  timeSlots, 
  startTime, 
  endTime, 
  setStartTime, 
  setEndTime,
  setNumPlayers // Add setNumPlayers to the props
}) => {
  // Visual offset for single-slot selection (percentage of step)
  const VISUAL_OFFSET = 0.3;
  
  // Create a chronological mapping of time slots
  const {
    sortedIndices,
    reverseMapping,
    sortedTimeSlots
  } = useMemo(() => {
    // Map each slot to its original index and sort by start time
    const mappedSlots = timeSlots.map((slot, index) => ({
      slot,
      originalIndex: index
    })).sort((a, b) => {
      const aStartTime = a.slot.time.split('-')[0];
      const bStartTime = b.slot.time.split('-')[0];
      return aStartTime.localeCompare(bStartTime);
    });
    
    // Extract the sorted indices
    const sortedIndices = mappedSlots.map(item => item.originalIndex);
    
    // Create reverse mapping (original index -> sorted position)
    const reverseMapping = {};
    sortedIndices.forEach((originalIndex, sortedPos) => {
      reverseMapping[originalIndex] = sortedPos;
    });
    
    // Create sorted timeSlots array
    const sortedTimeSlots = mappedSlots.map(item => item.slot);
    
    return { sortedIndices, reverseMapping, sortedTimeSlots };
  }, [timeSlots]);
  
  // Convert from original indices to slider positions with visual separation
  const [sliderValues, setSliderValues] = useState([0, 0]);
  
  useEffect(() => {
    const startSliderPos = reverseMapping[startTime] ?? 0;
    const endSliderPos = reverseMapping[endTime] ?? 0;
    
    // If selecting the same position, add a visual offset
    if (startSliderPos === endSliderPos) {
      setSliderValues([
        startSliderPos - VISUAL_OFFSET, 
        endSliderPos + VISUAL_OFFSET
      ]);
    } else {
      setSliderValues([startSliderPos, endSliderPos]);
    }
  }, [startTime, endTime, reverseMapping]);
  
  const handleTimeChange = (values) => {
    // Round to the nearest step to handle visual offset
    const newStartSliderPos = Math.round(values[0]);
    const newEndSliderPos = Math.round(values[1]);
    
    // Convert slider positions back to original timeSlot indices
    const newStartTime = sortedIndices[newStartSliderPos];
    const newEndTime = sortedIndices[newEndSliderPos];
    
    setStartTime(newStartTime);
    setEndTime(newEndTime);
    
    // After updating start and end times, recalculate and update max players
    updateMaxPlayers(newStartTime, newEndTime);
  };

  // Function to update max players based on selected time slots
  const updateMaxPlayers = (start, end) => {
    if (!setNumPlayers) return; // Skip if setNumPlayers is not provided
    
    // Get all selected slot indices in chronological order
    const startPos = reverseMapping[start];
    const endPos = reverseMapping[end];
    const minPos = Math.min(startPos, endPos);
    const maxPos = Math.max(startPos, endPos);
    
    // Get original indices for all positions between minPos and maxPos
    const selectedIndices = sortedIndices.slice(minPos, maxPos + 1);
    
    // Find the minimum capacity among selected slots
    const minCapacity = Math.min(...selectedIndices.map(index => timeSlots[index].capacity));
    
    // Update numPlayers to respect the new maximum
    setNumPlayers(currentNumPlayers => Math.min(currentNumPlayers, minCapacity));
  };
  
  // Call updateMaxPlayers whenever the selected time range changes
  useEffect(() => {
    updateMaxPlayers(startTime, endTime);
  }, [startTime, endTime]);

  // Get the start time of the selected start slot
  const getDisplayStartTime = () => {
    if (!timeSlots[startTime] || !timeSlots[startTime].time) return "";
    return timeSlots[startTime].time.split("-")[0].trim();
  };

  // Get the end time of the selected end slot
  const getDisplayEndTime = () => {
    if (!timeSlots[endTime] || !timeSlots[endTime].time) return "";
    return timeSlots[endTime].time.split("-")[1].trim();
  };

  // Calculate the number of hours selected (based on chronological order)
  const getHoursSelected = () => {
    const startPos = reverseMapping[startTime];
    const endPos = reverseMapping[endTime];
    return Math.abs(endPos - startPos) + 1;
  };

  // Get the selected time slots in chronological order
  const getSelectedSlots = () => {
    const startPos = reverseMapping[startTime];
    const endPos = reverseMapping[endTime];
    const minPos = Math.min(startPos, endPos);
    const maxPos = Math.max(startPos, endPos);
    
    // Get original indices for all positions between minPos and maxPos
    return sortedIndices.slice(minPos, maxPos + 1);
  };

  const selectedSlotIndices = getSelectedSlots();
  const hoursSelected = getHoursSelected();
  
  // Calculate max capacity across selected slots
  const maxCapacity = Math.min(...selectedSlotIndices.map(index => timeSlots[index].capacity));

  return (
    <View style={styles.container}>
      {/* Display Start and End Times */}
      <Text style={styles.label}>{getDisplayStartTime()} - {getDisplayEndTime()}</Text>

      {/* MultiSlider component */}
      <MultiSlider
        values={sliderValues}
        sliderLength={300}
        min={0}
        max={timeSlots.length - 1}
        step={1}
        allowOverlap={true}
        snapped={false} // Allow non-integer positions for visual separation
        onValuesChange={handleTimeChange}
        onValuesChangeFinish={handleTimeChange} // Ensure final values are applied
        selectedStyle={{ backgroundColor: "#FF006E" }}
        markerStyle={{ backgroundColor: "#FF006E" }}
        minMarkerOverlapDistance={0}
      />

      {/* Display selected time range */}
      <Text style={styles.selectionInfo}>
        Selected: {hoursSelected === 1 ? "1 hour" : `${hoursSelected} hours`}
      </Text>

      {/* Display Max Players */}
      <Text style={styles.maxPlayers}>
        Max Players: {maxCapacity}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    alignItems: "center",
  },
  label: {
    fontSize: 20,
    marginBottom: 5,
    flexDirection: "row",
  },
  selectionInfo: {
    marginTop: 10,
    fontSize: 14,
    color: "#333",
  },
  maxPlayers: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF006E",
  }
});

export default TimeRangeSlider;