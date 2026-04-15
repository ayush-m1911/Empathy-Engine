def generate_ssml(text, emotion, intensity):

    if emotion == "anger":
        return f"""
        <speak>
            {text}
            <break time="300ms"/>
        </speak>
        """

    elif emotion == "sad":
        return f"""
        <speak>
            {text}
            <break time="500ms"/>
        </speak>
        """

    elif emotion == "excited":
        return f"""
        <speak>
            <emphasis level="moderate">{text}</emphasis>
        </speak>
        """

    else:
        return f"<speak>{text}</speak>"