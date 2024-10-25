import { Loader } from "@mantine/core"

export const LoaderPage = () => {
    return <div style={{ 'display': 'flex', 'justifyContent': 'center', 'alignItems': 'center', 'position': 'absolute', 'top': 0, 'left': 0, 'width': '100vw', 'height': '100vh', 'zIndex': 9999999999}}>
        <Loader/>
    </div>
}