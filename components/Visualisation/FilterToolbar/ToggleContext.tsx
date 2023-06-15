import React, {createContext} from "react";

interface ToggleContextType {
    isToggled: boolean;
    setToggled: (value: boolean) => void;
}

const ToggleContext = createContext<ToggleContextType>({
    isToggled: false,
    setToggled: () => {},
});

export const ToggleProvider: React.FC = ({ children }) => {
    const [isToggled, setIsToggled] = React.useState(false);

    const setToggled = (value: boolean) => {
        setIsToggled(value);
    };

    return (
        <ToggleContext.Provider value={{ isToggled, setToggled }}>
            {children}
        </ToggleContext.Provider>
    );
};

export default ToggleContext;