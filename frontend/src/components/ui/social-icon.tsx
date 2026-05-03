import { Button } from "@/components/ui/button";

const ButtonSocialIconDemo = () => {
  return (
    <div className="flex items-center justify-center gap-4 flex-wrap">
      {/* whatsapp (replaced google) */}
      <Button
        variant="outline"
        size="icon"
        type="button"
        className="rounded-lg hover:scale-110 transition-all duration-300 cursor-pointer"
        onClick={() => window.open("https://web.whatsapp.com/", "_blank")}
      >
        <img
          src="https://www.vectorlogo.zone/logos/whatsapp/whatsapp-icon.svg"
          alt="whatsapp icon"
          className="h-5 w-5"
        />
      </Button>
      
      {/* instagram (replaced github) */}
      <Button
        variant="outline"
        size="icon"
        type="button"
        className="rounded-lg hover:scale-110 transition-all duration-300 cursor-pointer"
      >
        <img
          src="https://www.vectorlogo.zone/logos/instagram/instagram-icon.svg"
          alt="instagram icon"
          className="h-5 w-5"
        />
      </Button>

      {/* linkedin */}
      <Button
        variant="outline"
        size="icon"
        type="button"
        className="rounded-lg hover:scale-110 transition-all duration-300 cursor-pointer"
      >
        <img
          src="https://images.shadcnspace.com/assets/svgs/icon-linkedin.svg"
          alt="linkedin icon"
          className="h-4 w-4"
        />
      </Button>

      {/* facebook */}
      <Button
        variant="outline"
        size="icon"
        type="button"
        className="rounded-lg hover:scale-110 transition-all duration-300 cursor-pointer"
      >
        <img
          src="https://images.shadcnspace.com/assets/svgs/icon-facebook.svg"
          alt="facebook icon"
          className="h-4 w-4"
        />
      </Button>
    </div>
  );
};

export default ButtonSocialIconDemo;
