import { useState } from "react";
import { Select } from "../components/Select/Select";
import { fetchDramas } from "../common/api";
import top100Films from "../common/mocks/dramas.json";

function DemoPage() {
  const [selectedValue, setSelectedValue] = useState<string>();
  const [selectedVal, setSelectedVal] = useState<string>();

  return (
    <div className="mt-10">
      <Select
        value={selectedValue}
        options={top100Films}
        onChange={(value) => setSelectedValue(value)}
      />
      <div className="mt-10"></div>
      <Select
        value={selectedVal}
        options={fetchDramas}
        onChange={(value) => setSelectedVal(value)}
      />
    </div>
  );
}

export default DemoPage;
