import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Drawer } from '@/components/ui/drawer';
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSeparator, FieldSet, FieldTitle } from '@/components/ui/field';
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupTextarea } from '@/components/ui/input-group';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectItem } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import ThemeText from '@/components/ui/text';
import { useThemeColors } from '@/hooks/use-theme-colors';
import { cn } from '@/lib/utils';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { Control, Controller, FieldValues, Path } from 'react-hook-form';
import { View } from 'react-native';
import { Calendar } from '../ui/calendar';
import AutoComplete from './auto-complete';
import MultipleAutoComplete from './multiple-auto-complete';

type FormBuilderFieldType =
    | "text"
    | "email"
    | "textArea"
    | "numeric"
    | "password"
    | "checkbox"
    | "radio-with-description"
    | "radio"
    | "switch"
    | "date"
    | "select"
    | "auto-complete"
    | "multiple-auto-complete"
    | "separator";

type FormBuilderField<T extends FieldValues> = {
    type: FormBuilderFieldType;
    name: Path<T>;
    label: string;
    placeholder?: string;
    options?: readonly { label: string; value: string, description?: string, }[];
    description?: string;
    icon?: React.ReactNode;
    iconPosition?: "block-start" | "block-end" | "inline-start" | "inline-end";
    url?: string;
    fieldName?: string
    column?: string
    modal?: string
    keyName?: string
    className?: string;
    orientation?: "horizontal" | "vertical" | "responsive";
    colSpan?: "col-span-1" | "col-span-2" | "col-span-full";
    separatorText?: string;
    separator?: boolean;
};

export function createFormField<T extends FieldValues>(field: FormBuilderField<T>): FormBuilderField<T> {
    return field;
}

type FormBuilderProps<T extends FieldValues> = {
    fields: readonly FormBuilderField<T>[];
    control: Control<T>;
    className?: string;
}

export type { FormBuilderField, FormBuilderFieldType };

export default function FormBuilder<T extends FieldValues>({ fields, control, className }: FormBuilderProps<T>) {
    const renderFields = () => {
        return fields.map((item, index) => {
            const colSpan = item.colSpan;
            switch (item.type) {

                case "text":
                case "email":
                    return <Controller
                        name={item.name}
                        key={index}
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className={cn('', item.className, colSpan)} orientation={item.orientation}>
                                {item.label && <FieldLabel htmlFor={field.name}>{item.label}</FieldLabel>}
                                <InputGroup data-disabled={fieldState.invalid}>
                                    <InputGroupInput
                                        placeholder={item.placeholder}
                                        {...field}
                                        keyboardType={item.type === "email" ? "email-address" : "default"}
                                    />
                                    {item.icon && <InputGroupAddon align={item.iconPosition || "inline-start"}>
                                        {item.icon}
                                    </InputGroupAddon>}
                                </InputGroup>
                                {item.description && <FieldDescription>
                                    {item.description}
                                </FieldDescription>}
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                case "textArea":
                    return <Controller
                        name={item.name}
                        key={index}
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className={cn('', item.className, colSpan)} orientation={item.orientation}>
                                {item.label && <FieldLabel htmlFor={field.name}>{item.label}</FieldLabel>}
                                <InputGroup data-disabled={fieldState.invalid}>
                                    <InputGroupTextarea
                                        placeholder={item.placeholder}
                                        {...field}
                                    />
                                    {item.icon && <InputGroupAddon align={item.iconPosition || "inline-start"}>
                                        {item.icon}
                                    </InputGroupAddon>}
                                </InputGroup>
                                {item.description && <FieldDescription>
                                    {item.description}
                                </FieldDescription>}
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                case "numeric":
                    return <Controller
                        name={item.name}
                        key={index}
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field data-invalid={fieldState.invalid} className={cn('', item.className, colSpan)}>
                                {item.label && <FieldLabel htmlFor={field.name}>{item.label}</FieldLabel>}
                                <InputGroup data-disabled={fieldState.invalid}>
                                    <InputGroupInput
                                        placeholder={item.placeholder}
                                        {...field}
                                        keyboardType='numeric'
                                    />
                                    {item.icon && <InputGroupAddon align={item.iconPosition || "inline-start"}>
                                        {item.icon}
                                    </InputGroupAddon>}
                                </InputGroup>
                                {item.description && <FieldDescription>
                                    {item.description}
                                </FieldDescription>}
                                {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                            </Field>
                        )}
                    />
                case "password":
                    return <Controller
                        name={item.name}
                        key={index}
                        control={control}
                        render={({ field, fieldState }) => {
                            const [showPassword, setShowPassword] = useState(false);
                            const colors = useThemeColors();
                            return (
                                <Field data-invalid={fieldState.invalid} className={cn('', item.className, colSpan)} orientation={item.orientation}>
                                    {item.label && <FieldLabel htmlFor={field.name}>{item.label}</FieldLabel>}
                                    <InputGroup data-disabled={fieldState.invalid}>
                                        <InputGroupInput
                                            placeholder={item.placeholder}
                                            {...field}
                                            secureTextEntry={!showPassword}
                                        />
                                        <InputGroupAddon align={item.iconPosition ?? "inline-end"}>
                                            {item.icon ? item.icon : <Button
                                                onPress={() => setShowPassword(!showPassword)}
                                                variant={"link"}
                                            >
                                                <Ionicons
                                                    name={showPassword ? "eye-off" : "eye"}
                                                    size={20}
                                                    color={colors.foreground}
                                                />
                                            </Button>}
                                        </InputGroupAddon>
                                    </InputGroup>
                                    {item.description && <FieldDescription>
                                        {item.description}
                                    </FieldDescription>}
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )
                        }}
                    />
                case "checkbox":
                    return <Controller
                        name={item.name}
                        key={index}
                        control={control}
                        render={({ field, fieldState }) => {
                            return (
                                <FieldSet data-invalid={fieldState.invalid} className={cn('', item.className, colSpan)} >
                                    {item.label && <FieldLegend variant="label">{item.label}</FieldLegend>}
                                    <Field orientation={item.orientation}>
                                        {item.options?.map((option) => (
                                            <Field
                                                key={option.value}
                                                orientation="horizontal"
                                                data-invalid={fieldState.invalid}
                                            >
                                                <Checkbox
                                                    id={`form-rhf-checkbox-${option.value}`}
                                                    name={field.name}
                                                    aria-invalid={fieldState.invalid}
                                                    checked={field.value?.includes(option.value)}
                                                    onCheckedChange={(checked) => {
                                                        const newValue = checked
                                                            ? [...(field.value ?? []), option.value]
                                                            : field.value?.filter((value: string) => value !== option.value)
                                                        field.onChange(newValue)
                                                    }}
                                                />
                                                <FieldLabel
                                                    htmlFor={`form-rhf-checkbox-${option.value}`}
                                                    className="font-normal"
                                                >
                                                    {option.label}
                                                </FieldLabel>
                                            </Field>
                                        ))}
                                    </Field>
                                    {item.description && <FieldDescription>
                                        {item.description}
                                    </FieldDescription>}
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </FieldSet>
                            )
                        }}
                    />
                case "radio-with-description":
                    return <Controller
                        name={item.name}
                        key={index}
                        control={control}
                        render={({ field, fieldState }) => {
                            const isInvalid = fieldState.invalid
                            return (
                                <FieldSet data-invalid={isInvalid} className={cn('', item.className, colSpan)}>
                                    <FieldLegend variant="label">{item.label}</FieldLegend>
                                    <RadioGroup
                                        name={field.name}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        aria-invalid={isInvalid}
                                        className={item.orientation === "horizontal" ? "flex justify-between" : ""}
                                    >
                                        {item.options?.map((option) => (
                                            <FieldLabel htmlFor={`form-rhf-complex-${option.value}`} key={option.value} >
                                                <Field orientation={'responsive'} data-invalid={isInvalid}>
                                                    <FieldContent>
                                                        <FieldTitle>{option.label}</FieldTitle>
                                                        {option.description && <FieldDescription>
                                                            {option.description}
                                                        </FieldDescription>}
                                                    </FieldContent>
                                                    <RadioGroupItem
                                                        value={option.value}
                                                        id={`form-rhf-complex-${option.value}`}
                                                    />
                                                </Field>
                                            </FieldLabel>
                                        ))}

                                    </RadioGroup>
                                    {isInvalid && <FieldError errors={[fieldState.error]} />}
                                </FieldSet>
                            )
                        }}
                    />
                case "radio":
                    return <Controller
                        name={item.name}
                        key={index}
                        control={control}
                        render={({ field, fieldState }) => {
                            return (
                                <FieldSet data-invalid={fieldState.invalid} className={cn('', item.className, colSpan)} >
                                    {item.label && <FieldLegend variant="label">{item.label}</FieldLegend>}
                                    <RadioGroup
                                        name={field.name}
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        aria-invalid={fieldState.invalid}
                                        className={item.orientation === "horizontal" ? "flex flex-row gap-4" : ""}
                                    >
                                        {item.options?.map((option) => (
                                            <View key={option.value} className="flex items-center gap-2">
                                                <RadioGroupItem
                                                    value={option.value}
                                                    id={`form-rhf-complex-${option.value}`}
                                                />
                                                <FieldLabel>
                                                    {option.label}
                                                </FieldLabel>
                                            </View>
                                        ))}
                                    </RadioGroup>
                                    {item.description && <FieldDescription>
                                        {item.description}
                                    </FieldDescription>}
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </FieldSet>
                            )
                        }}
                    />
                case "switch":
                    return <Controller
                        name={item.name}
                        key={index}
                        control={control}
                        render={({ field, fieldState }) => (
                            <Field
                                orientation="horizontal"
                                data-invalid={fieldState.invalid}
                                className={cn('', item.className, colSpan)}
                            >
                                <FieldContent>
                                    {item.label && <FieldLabel htmlFor={`form-rhf-complex-${item.name}`}>
                                        {item.label}
                                    </FieldLabel>}
                                    {item.description && <FieldDescription>
                                        {item.description}
                                    </FieldDescription>}
                                </FieldContent>
                                <Switch
                                    id={`form-rhf-complex-${item.name}`}
                                    name={field.name}
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                    aria-invalid={fieldState.invalid}
                                />
                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                case "date":
                    return <Controller
                        name={item.name}
                        key={index}
                        control={control}
                        render={({ field, fieldState }) => {
                            const [open, setOpen] = useState(false);
                            const colors = useThemeColors();
                            return (
                                <Field data-invalid={fieldState.invalid} className={cn('', item.className, colSpan)} orientation={item.orientation}>
                                    {item.label && <FieldLabel>{item.label}</FieldLabel>}
                                    <Button
                                        variant={'outline'}
                                        className={cn(
                                            'w-full justify-start text-left font-normal',
                                            !field.value && 'text-muted-foreground',
                                        )}
                                        onPress={() => setOpen(true)}
                                    >
                                        <Ionicons name="calendar-outline" size={16} color={colors.foreground} />
                                        <ThemeText className="ml-2">
                                            {field.value &&
                                                !isNaN(new Date(field.value).getTime()) ? (
                                                format(new Date(field.value), 'PPP')
                                            ) : (
                                                'Pick a date'
                                            )}
                                        </ThemeText>
                                    </Button>
                                    <Drawer open={open} onClose={() => setOpen(false)}>
                                        <Calendar
                                            mode="single"
                                            selected={field.value}
                                            onSelect={(date: any) => {
                                                field.onChange(date);
                                                setOpen(false);
                                            }}
                                        />
                                    </Drawer>
                                    {item.description && <FieldDescription>
                                        {item.description}
                                    </FieldDescription>}
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            );
                        }}
                    />
                case "select":
                    return <Controller
                        name={item.name}
                        key={index}
                        control={control}
                        render={({ field, fieldState }) => {
                            return (
                                <Field data-invalid={fieldState.invalid} className={cn('', item.className, colSpan)} orientation={item.orientation}>
                                    {item.label && <FieldLabel>{item.label}</FieldLabel>}
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                        placeholder={item.placeholder}
                                    >
                                        {item.options?.map((option) => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </Select>
                                    {item.description && <FieldDescription>
                                        {item.description}
                                    </FieldDescription>}
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            )
                        }}
                    />
                case "auto-complete":
                    return item.fieldName && item.column && item.modal ? <Controller
                        name={item.name}
                        key={index}
                        control={control}
                        render={({ field, fieldState }) => {
                            return (
                                <Field data-invalid={fieldState.invalid} className={cn('', item.className, colSpan)} orientation={item.orientation}>
                                    {item.label && <FieldLabel htmlFor={field.name}>{item.label}</FieldLabel>}
                                    <AutoComplete
                                        url={item.url ?? "/common/auto-complete"}
                                        fieldName={item.fieldName ?? ""}
                                        field={field}
                                        column={item.column ?? ""}
                                        modal={item.modal ?? ""}
                                        error={fieldState.error}
                                        listClassName="md:w-92 w-72"
                                    />
                                    {item.description && <FieldDescription>
                                        {item.description}
                                    </FieldDescription>}
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            );
                        }}
                    /> : null;
                case "multiple-auto-complete":
                    return item.url && item.keyName ? <Controller
                        name={item.name}
                        key={index}
                        control={control}
                        render={({ field, fieldState }) => {
                            return (
                                <Field data-invalid={fieldState.invalid} className={cn('', item.className, colSpan)} orientation={item.orientation}>
                                    {item.label && <FieldLabel htmlFor={field.name}>{item.label}</FieldLabel>}
                                    <MultipleAutoComplete
                                        url={item.url}
                                        field={field}
                                        fieldName={item.keyName ?? item.name}
                                        multiple={true}
                                        showIndex={true}
                                    />
                                    {item.description && <FieldDescription>
                                        {item.description}
                                    </FieldDescription>}
                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                </Field>
                            );
                        }}
                    /> : null;
                case "separator":
                    return (
                        <View key={index} className={cn('', item.className, colSpan)}>
                            <FieldSeparator>
                                {item.separatorText}
                            </FieldSeparator>
                        </View>
                    );
                default:
                    return <View key={index}><ThemeText>Default</ThemeText></View>
            }
        })
    }
    return (
        <FieldGroup className={cn('', className)}>{renderFields()}</FieldGroup>
    )
}
