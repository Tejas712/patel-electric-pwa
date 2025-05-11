import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { FieldType } from '../data/field';

interface Customer {
  name: string;
  phone: string;
  address: string;
}

export interface PricingEntry {
  id: string;
  timestamp: number;
  customer: Customer;
  wiresValues: FieldType[];
  priceValues: FieldType[];
}

interface UsePricingListProps {
  initialCustomer?: Customer;
  initialWiresValues?: FieldType[];
  initialPriceValues?: FieldType[];
  editId?: string | null;
}

export const usePricingList = ({
  initialCustomer = { name: '', phone: '', address: '' },
  initialWiresValues = [],
  initialPriceValues = [],
  editId = null
}: UsePricingListProps) => {
  const [customer, setCustomer] = useState<Customer>(initialCustomer);
  const [wiresValues, setWiresValues] = useState<FieldType[]>(initialWiresValues);
  const [priceValues, setPriceValues] = useState<FieldType[]>(initialPriceValues);

  const handleCustomerChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const handlePriceInputChange = (id: number, value: string) => {
    const numericValue = Number(value.replace(/[^0-9]/g, ""));
    setPriceValues((prevState) => {
      const prevClone = [...prevState];
      prevClone[id - 1].value = numericValue;
      return prevClone;
    });
  };

  const handleWireInputChange = (id: number, value: string) => {
    setWiresValues((prevState) => {
      const prevClone = [...prevState];
      prevClone[id - 1].value = value;
      return prevClone;
    });
  };

  const handleDeleteField = (field: FieldType, type: "wire" | "price") => {
    if (type === "wire") {
      setWiresValues(wiresValues.filter((w) => w.id !== field.id));
    } else {
      setPriceValues(priceValues.filter((p) => p.id !== field.id));
    }
  };

  const handleAddField = (type: "wire" | "price", label: string, value: string | number) => {
    const newField: FieldType = {
      id: type === "wire" ? wiresValues.length + 1 : priceValues.length + 1,
      label,
      value: type === "wire" ? value : Number(value) || 0,
    };

    if (type === "wire") {
      setWiresValues([...wiresValues, newField]);
    } else {
      setPriceValues([...priceValues, newField]);
    }
  };

  const saveOrUpdatePricing = () => {
    const pricingList: PricingEntry[] = JSON.parse(
      localStorage.getItem("pricingList") || "[]"
    );

    if (editId) {
      // Update existing
      const idx = pricingList.findIndex((p) => p.id === editId);
      if (idx !== -1) {
        pricingList[idx] = {
          ...pricingList[idx],
          customer,
          wiresValues,
          priceValues,
          timestamp: Date.now(),
        };
        localStorage.setItem("pricingList", JSON.stringify(pricingList));
        return { success: true, message: "Pricing updated!" };
      }
    }

    // Add new
    const newEntry: PricingEntry = {
      id: uuidv4(),
      timestamp: Date.now(),
      customer,
      wiresValues,
      priceValues,
    };
    pricingList.push(newEntry);
    localStorage.setItem("pricingList", JSON.stringify(pricingList));
    return { success: true, message: "Pricing saved!" };
  };

  return {
    customer,
    wiresValues,
    priceValues,
    handleCustomerChange,
    handlePriceInputChange,
    handleWireInputChange,
    handleDeleteField,
    handleAddField,
    saveOrUpdatePricing,
  };
}; 