import React, { FC, useState, useEffect, useMemo, memo } from "react";
import { FormGroup, FormMessage, SelectAsync, Label } from "@adminjs/design-system";
import {
  ApiClient,
  EditPropertyProps,
  PropertyLabel,
  RecordJSON,
  SelectRecord,
  allowOverride,
  flat,
} from "adminjs";

type CombinedProps = EditPropertyProps;
type SelectRecordEnhanced = SelectRecord & {
  record: RecordJSON;
};

const EditReference = (props) => {
  console.log("test reference");
  console.log(props);

  const { onChange, property, record } = props;
  const { reference: resourceId } = property;
  console.log(props);


  if (!resourceId) {
    throw new Error(`Cannot reference resource in property '${property.path}'`);
  }

  const handleChange = (selected: SelectRecordEnhanced): void => {
    if (selected) {
      onChange(property.path, selected.value, selected.record);
    } else {
      onChange(property.path, null);
    }
  };

  var loadOptions = async (
    inputValue: string
  ): Promise<SelectRecordEnhanced[]> => {
    const api = new ApiClient();
    console.log(inputValue);
    console.log(resourceId);
    let optionRecords: RecordJSON[];
    if (record?.params?.[`${resourceId}Data`]) {
      optionRecords = record?.params?.[`${resourceId}Data`];
    } else {
      optionRecords = await api.searchRecords({
        resourceId,
        query: inputValue,
      });
    }

    console.log(optionRecords);

    return optionRecords.map((optionRecord: RecordJSON) => ({
      value: optionRecord.id,
      label: optionRecord.title,
      record: optionRecord,
    }));
  };

  const error = record?.errors[property.path];

  const selectedId = useMemo(
    () => flat.get(record?.params, property.path) as string | undefined,
    [record]
  );
  const [loadedRecord, setLoadedRecord] = useState<RecordJSON | undefined>();
  const [loadingRecord, setLoadingRecord] = useState(0);

  useEffect(() => {
    if (selectedId) {
      setLoadingRecord((c) => c + 1);
      const api = new ApiClient();
      api
        .recordAction({
          actionName: "show",
          resourceId,
          recordId: selectedId,
        })
        .then(({ data }: any) => {
          setLoadedRecord(data.record);
        })
        .finally(() => {
          setLoadingRecord((c) => c - 1);
        });
    }
  }, [selectedId, resourceId]);

  const selectedValue = loadedRecord;
  const selectedOption =
    selectedId && selectedValue
      ? {
        value: selectedValue.id,
        label: selectedValue.title,
      }
      : {
        value: "",
        label: "",
      };

  return (
    <FormGroup error={Boolean(error)}>
      <Label >
        {property.label}
      </Label>
      <SelectAsync
        cacheOptions
        value={selectedOption}
        defaultOptions
        loadOptions={loadOptions}
        onChange={handleChange}
        isClearable
        isDisabled={property.isDisabled}
        isLoading={!!loadingRecord}
        {...property.props}
      />
      <FormMessage>{error?.message ?? ""}</FormMessage>
    </FormGroup>
  );
};

export default EditReference;