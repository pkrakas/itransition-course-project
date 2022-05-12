import { Button, Col, Form, Row } from "react-bootstrap";
import { useMemo, useState } from "react";
import "./CollectionEditMenu.css"
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import DropZone from 'react-drop-zone'
import ReactDOMServer from "react-dom/server";
import ReactMarkdown from 'react-markdown'
import { useTranslation } from "react-i18next";


export default function CollectionEditMenu({ onSubmit, cName = '', cTopic = 'Art', cDescription = '', cImage = '', header }) {

    const { t } = useTranslation()
    const [imageSrc, setImageSrc] = useState(cImage)
    const [imageRaw, setImageRaw] = useState('')
    const [name, setName] = useState(cName)
    const [topic, setTopic] = useState(cTopic)
    const [description, setDescription] = useState(cDescription)

    const onImageChange = (file) => {
        setImageSrc(URL.createObjectURL(file))
    }

    const onImageDrop = (file, text) => {
        onImageChange(file)

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            setImageRaw(reader.result)
        };

    }

    const customRendererOptions = useMemo(() => {
        return {
            previewRender(text) {
                return ReactDOMServer.renderToString(
                    <ReactMarkdown>{text}</ReactMarkdown>
                );
            },
        };
    }, []);

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '90vh' }}>
            <Form onSubmit={(e) => {
                e.preventDefault(); onSubmit({
                    name,
                    topic,
                    description,
                    image: imageRaw
                })
            }}>
                {header}
                <Row>
                    <Form.Group as={Col} className="d-flex justify-content-center align-items-center">
                        <DropZone onDrop={onImageDrop}>
                            {
                                ({ over, overDocument }) =>
                                    <div>
                                        {!imageSrc && (over ?
                                            <div className="image-box" style={{ border: '1px solid #0D6EFD' }}>
                                                <img width="50px" src="https://res.cloudinary.com/course-project-assets/image/upload/v1650889047/misc/upload-image-blue_htozwi.png" />
                                                <br />
                                                {t('pages.collections.dropImage')}
                                            </div> :
                                            <div className="image-box" style={{ border: '1px dotted grey' }}>
                                                <img width="50px" src="https://res.cloudinary.com/course-project-assets/image/upload/v1650889047/misc/upload-image-grey_ovjgak.png" />
                                                <br />
                                                {t('pages.collections.dropImage')}
                                            </div>)

                                        }
                                        {imageSrc && <div style={{ textAlign: 'center' }}><img src={imageSrc} style={{ maxWidth: '200px', maxHeight: '150px' }} /></div>}

                                    </div>
                            }
                        </DropZone>

                    </Form.Group>
                    <Form.Group as={Col}>
                        <Form.Label>{t('pages.collections.name')}</Form.Label>
                        <Form.Control placeholder={t('pages.collections.enterName')} value={name} onChange={(e) => setName(e.target.value)} />

                        <Form.Label className="mt-3">{t('pages.collections.topic')}</Form.Label>
                        <Form.Select onChange={(e) => setTopic(e.target.value)} value={topic}>
                            <option value="Art">{t('topics.art')}</option>
                            <option value="Books">{t('topics.books')}</option>
                            <option value="Botany">{t('topics.botany')}</option>
                            <option value="Clothing">{t('topics.clothing')}</option>
                            <option value="Furniture">{t('topics.furniture')}</option>
                            <option value="Jewelry">{t('topics.jewelry')}</option>
                        </Form.Select>
                    </Form.Group>
                </Row>
                <Row className="mt-3">
                    <Form.Group as={Col}>
                        <SimpleMDE style={{ width: '470px', maxHeight: '405px', overflowY: 'auto' }} value={description} onChange={(d) => setDescription(d)} options={customRendererOptions} />
                    </Form.Group>
                </Row>
                <Row className="justify-content-center">
                    <Button type="submit" style={{ width: '150px' }}>{t('pages.collections.submit')}</Button>
                </Row>
            </Form>
        </div>
    )
}