import React, { useState } from 'react';
import { View, FlatList } from 'react-native';

const HistoryDetailScreen = () => {
  const [yourData, setYourData] = useState([]);

  // Вместо использования вложенного FlatList
  const renderContent = () => {
    return yourData.map((dataItem, index) => (
      <View key={index}>
        {/* Рендер элемента без использования FlatList */}
      </View>
    ));
  };

  return (
    <FlatList
      data={[{ key: 'content' }]}
      renderItem={({ item }) => (
        <View>
          {/* Здесь не должно быть вложенных FlatList/ScrollView с той же ориентацией */}
          {yourData.length > 0 && (
            <View style={{ height: yourData.length * 50 }}>
              {renderContent()}
            </View>
          )}
        </View>
      )}
    />
  );
};

export default HistoryDetailScreen; 