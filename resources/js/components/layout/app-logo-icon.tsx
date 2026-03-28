export default function AppLogoIcon(props: React.ImgHTMLAttributes<HTMLImageElement>) {
    return (
        <img 
            src="http://localhost:8000/esama.png" 
            alt="Logo" 
            {...props}
            className={props.className}
        />
    );
}
