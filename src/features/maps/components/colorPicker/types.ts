
export interface Props {
    title: string;
    selectedItem: string | null;
    onSelectColor: (color: string) => void;
    onCancel: () => void;
    visible: boolean;
}