import TextureJATSData from './TextureJATS.data'
import deserializeSchema from '../xml/deserializeSchema'

const TextureJATS = deserializeSchema(TextureJATSData)

export default TextureJATS