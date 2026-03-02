import { Combobox } from "@/components/ui/combobox";
import { Label } from "@/components/ui/label";
import ThemeText from "@/components/ui/text";
import { useFetchClient } from "@/hooks/use-fetch-client";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { View } from "react-native";

interface SArrayInput {
    id?: string | number;
    [key: string]: any;
}

interface SArrayOption {
    id: string | number | undefined;
    label: string;
}

const sArray = (
    data: Record<string, SArrayInput> | SArrayInput[],
    fieldNames: string | string[]
): SArrayOption[] =>
    Object.values(data).map((value: SArrayInput) => ({
        id: value?.id,
        label: Array.isArray(fieldNames)
            ? fieldNames
                .map(
                    (fieldName) =>
                        fieldName
                            .split(".")
                            .reduce<any>((obj, key) => obj?.[key], value) || ""
                )
                .join(" ")
            : value?.[fieldNames] || "",
    }));

interface AutoCompleteProps {
    url?: string;
    label?: string;
    field: any;
    fieldName: string | string[];
    error?: { message?: string };
    staticOptions?: any[];
    column?: any;
    modal?: any;
    defaultValue?: any;
    customName?: string | null;
    disableAutoComplete?: boolean;
    showIndex?: boolean;
    emitOptions?: (item: any) => void;
    handleOnChangeFromStepper?: boolean;
    stepperHandleOnChange?: ((value: any) => void) | null;
    parentHierarchyCheck?: boolean;
    pol?: any;
    [key: string]: any;
    listClassName?: string;
}

function AutoComplete({
    url,
    label,
    field,
    fieldName,
    error,
    staticOptions,
    column,
    modal,
    defaultValue = null,
    customName = null,
    showIndex = false,
    emitOptions = () => { },
    handleOnChangeFromStepper = false,
    stepperHandleOnChange = null,
    pol,
    listClassName,
}: AutoCompleteProps) {
    const fetchClient = useFetchClient();

    const buildQueryParams = () => {
        return {
            column: Array.isArray(column) ? { ...column } : column,
            modal,
        };
    };

    const fetchOptions = async (_key: string, params: any) => {
        const res = await fetchClient(url!, { params });
        if (res.status !== 200) throw new Error("Fetch failed");
        return res.data?.data || [];
    };

    const { data: optionsData = [], isFetching } = useQuery({
        queryKey: ["autocomplete-options", url],
        queryFn: () => fetchOptions(url!, buildQueryParams()),
        enabled: !!url && !staticOptions,
    });

    const options = staticOptions || sArray(optionsData, fieldName);

    useEffect(() => {
        emitOptions(optionsData);
    }, [optionsData]);

    useEffect(() => {
        if (defaultValue && staticOptions) {
            const selected = staticOptions.find((opt) => opt.id === field.value);
            field.onChange((selected || defaultValue).id);
        }
    }, [staticOptions]);

    // Convert options to combobox items format
    const comboboxItems = options.map((option, index) => ({
        value: String(typeof option === "object" ? option.id : option),
        label: `${showIndex ? `${index + 1}. ` : ""}${typeof option === "object" ? option.label : option}`,
    }));

    const handleValueChange = (value: string | string[]) => {
        // Handle only single value (not array)
        const selectedValue = Array.isArray(value) ? value[0] : value;

        const selectedOption = options.find((opt) =>
            String(typeof opt === "object" ? opt.id : opt) === selectedValue
        );
        const selectedId = typeof selectedOption === "object" ? selectedOption.id : selectedOption;

        (handleOnChangeFromStepper
            ? stepperHandleOnChange
            : field.onChange)?.(selectedId);
    };

    return (
        <View className="w-full">
            {label && (
                <Label className="mb-1 capitalize text-sm font-medium">
                    <ThemeText className="text-sm font-medium">{label}</ThemeText>
                </Label>
            )}
            <Combobox
                value={String(field?.value || "")}
                onValueChange={handleValueChange}
                placeholder="Select an option"
                searchPlaceholder="Search..."
                items={comboboxItems}
                emptyText={isFetching ? "Loading..." : "No available option."}
                className={cn(error && "border-destructive")}
                triggerClassName={cn(error && "border-destructive")}
            />
            {error?.message && (
                <ThemeText className="text-sm text-destructive mt-1">
                    {error.message}
                </ThemeText>
            )}
        </View>
    );
}

export default AutoComplete;
